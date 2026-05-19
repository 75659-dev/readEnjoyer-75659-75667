import { useEffect, useMemo, useState } from "react";
import { HeroSection } from "../components/HeroSection";
import { TrendingBooksSection } from "../components/TrendingBooksSection";
import { CategoriesSection } from "../components/CategoriesSection";
import { CTASection } from "../components/CTASection";
import type { Book } from "../components/BookCard";
import { booksService, type Book as ApiBook } from "../services/books.service";
import {
  categoriesService,
  type Category,
} from "../services/categories.service";
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
  return {
    id: Number(book.id),
    title: book.title,
    author: typeof book.author === "object" ? book.author.name : book.author,
    authorId: typeof book.author === "object" ? book.author.id : undefined,
    rating: getAverageRating(book),
    coverColor: coverColors[index % coverColors.length],
    coverUrl: getFileUrl(book.image || book.coverUrl),
    category: book.categories?.[0]?.name,
  };
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isBooksLoading, setIsBooksLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [booksError, setBooksError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");

  useEffect(() => {
    async function loadBooks() {
      try {
        const data = await booksService.getAll();
        setBooks(data.map(mapBook));
      } catch {
        setBooksError("Failed to load books.");
      } finally {
        setIsBooksLoading(false);
      }
    }

    async function loadCategories() {
      try {
        const data = await categoriesService.getAll();
        setCategories(data);
      } catch {
        setCategoriesError("Failed to load genres.");
      } finally {
        setIsCategoriesLoading(false);
      }
    }

    loadBooks();
    loadCategories();
  }, []);

  const trendingBooks = useMemo(
    () =>
      [...books]
        .sort((first, second) => second.rating - first.rating)
        .slice(0, 6),
    [books],
  );

  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <TrendingBooksSection
        books={trendingBooks}
        isLoading={isBooksLoading}
        error={booksError}
      />
      <CategoriesSection
        categories={categories}
        isLoading={isCategoriesLoading}
        error={categoriesError}
      />
      <section className="bg-white py-10 px-4 border-t border-violet-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Project authors
          </h2>
          <p className="text-gray-600">
            This project was created by Oleh Dushynskyi 75659 and Danil Doshyn
            75667.
          </p>
        </div>
      </section>
      <CTASection />
    </main>
  );
}
