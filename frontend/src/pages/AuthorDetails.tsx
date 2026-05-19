import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { User } from "lucide-react";
import PageContainer from "../components/common/PageContainer";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/common/EmptyState";
import BookGrid from "../components/common/BookGrid";
import { authorsService, type Author } from "../services/authors.service";
import { booksService, type Book as ApiBook } from "../services/books.service";
import type { Book } from "../components/BookCard";
import { getFileUrl } from "../utils/files";

const coverColors = ["#a78bfa", "#d8b4fe", "#c084fc", "#e879f9", "#b794f6"];

function getAverageRating(book: ApiBook) {
  if (!book.reviews?.length) {
    return 0;
  }

  const total = book.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / book.reviews.length).toFixed(1));
}

function mapBook(book: ApiBook, index: number): Book {
  const categories = book.categories?.map((category) => category.name) ?? [];

  return {
    id: Number(book.id),
    title: book.title,
    author: typeof book.author === "object" ? book.author.name : book.author,
    authorId: typeof book.author === "object" ? book.author.id : undefined,
    rating: getAverageRating(book),
    coverColor: coverColors[index % coverColors.length],
    coverUrl: getFileUrl(book.image || book.coverUrl),
    category: categories[0],
    categories,
  };
}

export default function AuthorDetails() {
  const { id } = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [authorBooks, setAuthorBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAuthorDetails() {
      if (!id) {
        setError("Author id is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const [authorData, booksData] = await Promise.all([
          authorsService.getById(id),
          booksService.getAll(),
        ]);

        setAuthor(authorData);
        setAuthorBooks(
          booksData
            .filter(
              (book) =>
                typeof book.author === "object" && book.author.id === authorData.id,
            )
            .map(mapBook),
        );
      } catch {
        setError("Failed to load author.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthorDetails();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-sm text-gray-500">Loading author...</div>
      </PageContainer>
    );
  }

  if (error || !author) {
    return (
      <PageContainer>
        <h2 className="text-xl font-semibold">Author not found</h2>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </PageContainer>
    );
  }

  const imageUrl = getFileUrl(author.image);

  return (
    <PageContainer>
      <div className="flex items-center gap-6 mb-6">
        <div className="w-28 h-28 rounded-full flex items-center justify-center overflow-hidden bg-violet-400 text-white text-2xl font-bold">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={author.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <User size={36} className="text-white/90" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{author.name}</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">
            {author.bio || "No biography available yet."}
          </p>
        </div>
      </div>

      <section>
        <SectionHeader title={`Books by ${author.name}`} className="mb-4" />

        {authorBooks.length === 0 ? (
          <EmptyState message="No books found for this author." />
        ) : (
          <BookGrid books={authorBooks} />
        )}
      </section>
    </PageContainer>
  );
}
