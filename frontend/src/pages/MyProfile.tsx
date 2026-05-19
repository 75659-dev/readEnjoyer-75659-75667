import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PageContainer from "../components/common/PageContainer";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/common/EmptyState";
import BookGrid from "../components/common/BookGrid";
import ProfileHeader from "../components/common/ProfileHeader";
import ReviewList from "../components/common/ReviewList";
import { usersService } from "../services/users.service";
import type { User } from "../services/auth.service";
import { getFileUrl } from "../utils/files";
import { libraryService } from "../services/library.service";
import { reviewsService, type ApiReview } from "../services/reviews.service";
import type { Book as ApiBook } from "../services/books.service";
import type { Book } from "../components/BookCard";
import { filesService } from "../services/files.service";

type Review = {
  id: number | string;
  bookTitle: string;
  rating: number;
  text: string;
  date: string;
};

const coverColors = ["#a78bfa", "#d8b4fe", "#c084fc", "#e879f9", "#b794f6"];

type ProfileBook = Book & {
  status: "reading" | "read" | "want";
};

function getAverageRating(book: ApiBook) {
  if (!book.reviews?.length) {
    return 0;
  }

  const total = book.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / book.reviews.length).toFixed(1));
}

function mapBook(book: ApiBook, index: number, status: ProfileBook["status"]) {
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
    status,
  };
}

function mapStatus(status: string): ProfileBook["status"] {
  if (status === "READING") return "reading";
  if (status === "READ") return "read";
  return "want";
}

function mapReview(review: ApiReview): Review {
  return {
    id: review.id,
    bookTitle: review.book?.title || `Book #${review.bookId}`,
    rating: review.rating,
    text: review.text || "No review text.",
    date: new Date(review.createdAt).toISOString().split("T")[0],
  };
}

export default function MyProfile() {
  const [profile, setProfile] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarValue, setAvatarValue] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [library, setLibrary] = useState<ProfileBook[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [data, libraryData, reviewsData] = await Promise.all([
          usersService.getMe(),
          libraryService.getMine(),
          reviewsService.getMine(),
        ]);
        setProfile(data);
        setDisplayName(data.username);
        setAvatarValue(data.avatar || "");
        setLibrary(
          libraryData.map((item, index) =>
            mapBook(item.book, index, mapStatus(item.status)),
          ),
        );
        setReviews(reviewsData.map(mapReview));
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;
        setError(
          Array.isArray(message)
            ? message.join(" ")
            : message || "Failed to load profile.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const readingNow = useMemo(
    () => library.filter((b) => b.status === "reading"),
    [library],
  );
  const readBooks = useMemo(
    () => library.filter((b) => b.status === "read"),
    [library],
  );
  const avatarUrl = getFileUrl(avatarValue);

  async function handleSaveProfile() {
    setFormError("");

    try {
      const nextName = displayName.trim() || profile?.username || "User";
      const updatedProfile = await usersService.updateProfile({
        username: nextName,
        avatar: avatarValue.trim() || undefined,
      });
      setProfile((current) => ({ ...current, ...updatedProfile }) as User);
      setDisplayName(updatedProfile.username);
      setAvatarValue(updatedProfile.avatar || "");
      localStorage.setItem("authUser", updatedProfile.username);
      window.dispatchEvent(new Event("authChange"));
      setIsEditOpen(false);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setFormError(
        Array.isArray(message)
          ? message.join(" ")
          : message || "Failed to save profile.",
      );
    }
  }

  async function handleAvatarUpload(file?: File) {
    if (!file) return;
    setFormError("");
    setIsAvatarUploading(true);
    try {
      const result = await filesService.upload(file);
      setAvatarValue(result.fileId);
      const updatedProfile = await usersService.updateProfile({
        avatar: result.fileId,
      });
      setProfile((current) => ({ ...current, ...updatedProfile }) as User);
      window.dispatchEvent(new Event("authChange"));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setFormError(
        Array.isArray(message)
          ? message.join(" ")
          : message || "Failed to upload avatar.",
      );
    } finally {
      setIsAvatarUploading(false);
    }
  }

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-sm text-gray-500">Loading profile...</div>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <h2 className="text-xl font-semibold">Profile unavailable</h2>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileHeader
        name={profile.username}
        role={profile.role}
        allowOverflow
        avatar={
          <div className="relative group w-full h-full">
            <button
              type="button"
              onClick={() => setIsEditOpen((v) => !v)}
              className="w-full h-full rounded-full flex items-center justify-center text-violet-700 text-2xl font-bold overflow-hidden focus:outline-none focus:ring-2 focus:ring-violet-400"
              aria-label="Edit profile"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                (profile.username || "U").slice(0, 1).toUpperCase()
              )}
            </button>
            <div className="absolute inset-0 rounded-full bg-black/40 text-white text-xs font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Edit
            </div>

            {isEditOpen && (
              <div className="absolute left-0 mt-3 w-72 bg-white border rounded-lg shadow-lg p-4 z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Edit profile</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Close
                  </button>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Your name"
                />
                <label className="block text-sm font-medium text-gray-700 mt-3 mb-1">
                  Avatar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  className="w-full text-sm"
                />
                {isAvatarUploading && (
                  <div className="mt-2 text-sm text-gray-500">
                    Uploading avatar...
                  </div>
                )}
                {formError && (
                  <div className="mt-3 text-sm text-red-600">{formError}</div>
                )}
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="mt-3 bg-violet-600 text-white px-4 py-2 rounded text-sm"
                >
                  Save profile
                </button>
              </div>
            )}
          </div>
        }
      />

      <section className="mb-8">
        <SectionHeader title="Currently reading" />
        {readingNow.length === 0 ? (
          <EmptyState message="No books in progress." />
        ) : (
          <BookGrid books={readingNow} />
        )}
      </section>

      <section className="mb-8">
        <SectionHeader title="Read books" />
        {readBooks.length === 0 ? (
          <EmptyState message="No finished books yet." />
        ) : (
          <BookGrid books={readBooks} />
        )}
      </section>

      <section>
        <SectionHeader title="My reviews" />
        {reviews.length === 0 ? (
          <EmptyState message="No reviews yet." />
        ) : (
          <ReviewList reviews={reviews} />
        )}
      </section>
    </PageContainer>
  );
}
