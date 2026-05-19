import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Star, User } from "lucide-react";
import useAuth from "../hooks/useAuth";
import PageContainer from "../components/common/PageContainer";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/common/EmptyState";
import { booksService, type Book as ApiBook } from "../services/books.service";
import { reviewsService, type ApiReview } from "../services/reviews.service";
import { commentsService, type ApiComment } from "../services/comments.service";
import {
  libraryService,
  type ReadingStatus,
} from "../services/library.service";
import { getFileUrl } from "../utils/files";
import { usersService } from "../services/users.service";
import type { User as AuthUser } from "../services/auth.service";

type Review = ApiReview & {
  comments: ApiComment[];
};

function formatReadingTime(pages?: number | null) {
  if (!pages) {
    return "Unknown";
  }

  const hoursFloat = pages / 50;
  const hours = Math.floor(hoursFloat);
  const minutes = Math.round((hoursFloat - hours) * 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes}m`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function getAuthorName(book: ApiBook) {
  return typeof book.author === "object" ? book.author.name : book.author;
}

function getAuthorLink(book: ApiBook) {
  return typeof book.author === "object"
    ? `/authors/${book.author.id}`
    : "/authors";
}

function getAverageRating(reviews: Review[]) {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / reviews.length).toFixed(1));
}

function getErrorMessage(err: unknown, fallback: string) {
  const anyErr = err as any;
  const message = anyErr?.response?.data?.message ?? anyErr?.message ?? "";
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function Stars({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < full
              ? "fill-yellow-400 text-yellow-400"
              : i === full && half
                ? "text-yellow-400/70"
                : "text-gray-300"
          }
        />
      ))}
      <span className="text-sm font-bold text-gray-700">{value}</span>
    </div>
  );
}

export default function BookDetails() {
  const { id } = useParams();
  const bookId = Number(id || 0);
  const { isAuthenticated } = useAuth();

  const [book, setBook] = useState<ApiBook | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>(
    {},
  );
  const [libraryMessage, setLibraryMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function loadBookDetails() {
      if (!Number.isFinite(bookId) || bookId <= 0) {
        setError("Invalid book id.");
        setIsLoading(false);
        return;
      }

      try {
        const [bookData, reviewData, me] = await Promise.all([
          booksService.getById(bookId),
          reviewsService.getByBook(bookId),
          isAuthenticated ? usersService.getMe().catch(() => null) : null,
        ]);

        const reviewsWithComments = await Promise.all(
          reviewData.map(async (review) => ({
            ...review,
            comments: await commentsService.getByReview(review.id),
          })),
        );

        setBook(bookData);
        setReviews(reviewsWithComments);
        setCurrentUser(me);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load book details."));
      } finally {
        setIsLoading(false);
      }
    }

    loadBookDetails();
  }, [bookId, isAuthenticated]);

  const rating = useMemo(() => getAverageRating(reviews), [reviews]);

  async function handleCreateReview() {
    const text = newReviewText.trim();
    if (!text) {
      setFormError("Review text is required.");
      return;
    }

    setFormError("");

    try {
      const createdReview = await reviewsService.create({
        bookId,
        rating: newReviewRating,
        text,
      });
      setReviews((current) => [{ ...createdReview, comments: [] }, ...current]);
      setNewReviewText("");
      setNewReviewRating(5);
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to post review."));
    }
  }

  async function handleCreateComment(reviewId: string) {
    const text = (newCommentText[reviewId] || "").trim();
    if (!text) {
      return;
    }

    setFormError("");

    try {
      const createdComment = await commentsService.create({ reviewId, text });
      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? { ...review, comments: [...review.comments, createdComment] }
            : review,
        ),
      );
      setNewCommentText((current) => ({ ...current, [reviewId]: "" }));
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to post comment."));
    }
  }

  async function handleAddToLibrary(status: ReadingStatus) {
    setFormError("");
    setLibraryMessage("");

    try {
      await libraryService.addBook(bookId, { status });
      setLibraryMessage("Book added to your library.");
    } catch (err) {
      const message = getErrorMessage(err, "Failed to add book to library.");
      if (message.includes("already")) {
        await libraryService.updateBook(bookId, { status });
        setLibraryMessage("Library status updated.");
        return;
      }
      setFormError(message);
    }
  }

  function canDelete(ownerId?: string | number) {
    if (!currentUser) {
      return false;
    }

    return (
      currentUser.role === "ADMIN" || String(ownerId) === String(currentUser.id)
    );
  }

  async function handleDeleteReview(reviewId: string) {
    try {
      await reviewsService.remove(reviewId);
      setReviews((current) =>
        current.filter((review) => review.id !== reviewId),
      );
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to delete review."));
    }
  }

  async function handleDeleteComment(reviewId: string, commentId: string) {
    try {
      await commentsService.remove(commentId);
      setReviews((current) =>
        current.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                comments: review.comments.filter(
                  (comment) => comment.id !== commentId,
                ),
              }
            : review,
        ),
      );
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to delete comment."));
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-sm text-gray-500">Loading book...</div>
      </PageContainer>
    );
  }

  if (error || !book) {
    return (
      <PageContainer>
        <h2 className="text-xl font-semibold">Book not found</h2>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </PageContainer>
    );
  }

  const coverUrl = getFileUrl(book.image || book.coverUrl);
  const categories = book.categories ?? [];

  return (
    <PageContainer>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="col-span-1">
          <div className="w-full aspect-[3/4] rounded-lg overflow-hidden shadow bg-violet-200">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={book.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-violet-400 text-white text-3xl font-bold">
                {book.title
                  .split(" ")
                  .slice(0, 3)
                  .map((word) => word[0])
                  .join("")}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <div className="flex items-center gap-4 mb-4">
            <Link
              to={getAuthorLink(book)}
              className="text-sm text-violet-600 font-medium"
            >
              {getAuthorName(book)}
            </Link>
            <Stars value={rating} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700 mb-6">
            <div>
              <div className="text-xs text-gray-500">Categories</div>
              <div className="font-medium flex flex-wrap gap-1">
                {categories.length
                  ? categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/categories/${category.id}`}
                        className="text-violet-600 hover:text-violet-700"
                      >
                        #{category.name}
                      </Link>
                    ))
                  : "Uncategorized"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Price</div>
              <div className="font-medium">${book.price.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Pages</div>
              <div className="font-medium">{book.pages ?? "Unknown"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Reading time</div>
              <div className="font-medium">{formatReadingTime(book.pages)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Year</div>
              <div className="font-medium">{book.publishYear ?? "Unknown"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Stock</div>
              <div className="font-medium">{book.stock}</div>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p>{book.description || "No description available yet."}</p>
          </div>

          {isAuthenticated && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Add to my library
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAddToLibrary("WANT_TO_READ")}
                  className="px-3 py-2 rounded-lg border border-violet-200 bg-white text-violet-700 text-sm font-semibold hover:bg-violet-50"
                >
                  Plan to read
                </button>
                <button
                  onClick={() => handleAddToLibrary("READING")}
                  className="px-3 py-2 rounded-lg border border-violet-600 bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
                >
                  Start reading
                </button>
                <button
                  onClick={() => handleAddToLibrary("READ")}
                  className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  Mark as read
                </button>
              </div>
            </div>
          )}

          {libraryMessage && (
            <div role="status" className="text-sm text-emerald-700">
              {libraryMessage}
            </div>
          )}
        </div>
      </div>

      <section>
        <SectionHeader title="Reviews" className="mb-4" />

        {formError && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg"
          >
            {formError}
          </div>
        )}

        {isAuthenticated ? (
          <div className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold mb-2">Leave a review</h3>
            <div className="flex gap-2 items-center mb-2">
              <label className="text-sm text-gray-600">Rating:</label>
              <select
                value={newReviewRating}
                onChange={(e) => setNewReviewRating(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              className="w-full border rounded p-2 mb-2"
              rows={3}
              placeholder="Share your thoughts about the book"
            />
            <button
              onClick={handleCreateReview}
              className="bg-violet-600 text-white px-4 py-2 rounded"
            >
              Post review
            </button>
          </div>
        ) : (
          <EmptyState message="Log in to leave a review." className="mb-4" />
        )}

        {reviews.length === 0 ? (
          <EmptyState message="No reviews yet for this book." />
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {review.user?.avatar ? (
                      <img
                        src={
                          getFileUrl(review.user.avatar) || review.user.avatar
                        }
                        alt={review.user.username}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <User size={18} className="text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        {review.user?.id ? (
                          <Link
                            to={`/users/${review.user.id}`}
                            className="font-semibold hover:text-violet-600"
                          >
                            {review.user.username}
                          </Link>
                        ) : (
                          <div className="font-semibold">Anonymous</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {formatDate(review.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Stars value={review.rating} />
                        {canDelete(review.user?.id) && (
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-xs text-red-600"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 text-gray-700">
                      {review.text || "No review text."}
                    </p>

                    {review.comments.length > 0 && (
                      <div className="mt-3 border-l-2 border-gray-100 pl-3">
                        {review.comments.map((comment) => (
                          <div key={comment.id} className="mt-2">
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs text-gray-500">
                                {comment.user?.id ? (
                                  <Link
                                    to={`/users/${comment.user.id}`}
                                    className="hover:text-violet-600"
                                  >
                                    {comment.user.username}
                                  </Link>
                                ) : (
                                  "Anonymous"
                                )}{" "}
                                • {formatDate(comment.createdAt)}
                              </div>
                              {canDelete(comment.user?.id) && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(review.id, comment.id)
                                  }
                                  className="text-xs text-red-600"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <div className="text-sm text-gray-700">
                              {comment.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isAuthenticated && (
                      <div className="mt-3">
                        <textarea
                          value={newCommentText[review.id] || ""}
                          onChange={(e) =>
                            setNewCommentText((current) => ({
                              ...current,
                              [review.id]: e.target.value,
                            }))
                          }
                          className="w-full border rounded p-2 mb-2"
                          rows={2}
                          placeholder="Add a comment"
                        />
                        <button
                          onClick={() => handleCreateComment(review.id)}
                          className="bg-gray-100 px-3 py-1 rounded text-sm"
                        >
                          Post comment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
