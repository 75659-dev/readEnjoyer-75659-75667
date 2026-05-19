import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Library, ArrowLeft } from "lucide-react";
import { BookCard, type Book } from "../components/BookCard";
import SearchInput from "../components/common/SearchInput";
import EmptyCard from "../components/common/EmptyCard";
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

export default function CategoryBooks() {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id || 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategoryBooks() {
      if (!Number.isFinite(categoryId) || categoryId <= 0) {
        setError("Invalid category id.");
        setIsLoading(false);
        return;
      }

      try {
        const [categoriesData, booksData] = await Promise.all([
          categoriesService.getAll(),
          booksService.getAll(),
        ]);

        const currentCategory =
          categoriesData.find((item) => item.id === categoryId) ?? null;

        if (!currentCategory) {
          setError("Category not found.");
          return;
        }

        setCategory(currentCategory);
        setBooks(
          booksData
            .filter((book) =>
              book.categories?.some((item) => item.id === currentCategory.id),
            )
            .map(mapBook),
        );
      } catch {
        setError("Failed to load category.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoryBooks();
  }, [categoryId]);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return books;
    }

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.categories?.some((categoryName) =>
          categoryName.toLowerCase().includes(query),
        ),
    );
  }, [books, searchQuery]);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-12">
      <section className="bg-white border-b border-violet-100 py-8 px-4 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/categories"
            className="inline-flex items-center text-sm font-medium text-violet-600 hover:text-violet-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Categories
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm mb-2 uppercase">
                <Library size={18} />
                CATEGORY
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {category?.name || "Category"}
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl text-lg">
                {books.length} {books.length === 1 ? "book" : "books"} in this
                category
              </p>
            </div>

            <div className="w-full md:w-96">
              <SearchInput
                placeholder={`Search in ${category?.name || "category"}...`}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 px-4 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading category...</div>
          ) : error ? (
            <EmptyCard
              title="Category unavailable"
              description={error}
              icon={<Library />}
            />
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <EmptyCard
              title="No books found"
              description={
                searchQuery
                  ? `We couldn't find any books matching "${searchQuery}" in this category.`
                  : "There are no books in this category yet."
              }
              icon={<Library />}
            />
          )}
        </div>
      </section>
    </main>
  );
}
