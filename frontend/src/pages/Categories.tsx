import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Library, ArrowRight } from "lucide-react";
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

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategoriesPage() {
      try {
        const [categoriesData, booksData] = await Promise.all([
          categoriesService.getAll(),
          booksService.getAll(),
        ]);
        setCategories(categoriesData);
        setBooks(booksData.map(mapBook));
      } catch {
        setError("Failed to load categories.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategoriesPage();
  }, []);

  const filteredBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return books;
    }

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.categories?.some((category) =>
          category.toLowerCase().includes(query),
        ),
    );
  }, [books, searchQuery]);

  return (
    <main className="min-h-screen bg-gray-50/50">
      <section className="bg-white border-b border-violet-100 py-8 px-4 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm mb-2">
                <Library size={18} />
                CATEGORIES
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Browse by Category
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Explore books grouped by the categories stored in the backend.
              </p>
            </div>

            <div className="w-full md:w-96">
              <SearchInput
                placeholder="Search across all categories..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col pb-12">
        {isLoading ? (
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto text-sm text-gray-500">
              Loading categories...
            </div>
          </section>
        ) : error ? (
          <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
              <EmptyCard
                title="Categories unavailable"
                description={error}
                icon={<Library />}
              />
            </div>
          </section>
        ) : categories.length === 0 ? (
          <section className="py-20 px-4">
            <div className="max-w-3xl mx-auto">
              <EmptyCard
                title="No categories found"
                description="There are no categories in the catalog yet."
                icon={<Library />}
              />
            </div>
          </section>
        ) : (
          categories.map((category, index) => {
            const booksInCategory = filteredBooks.filter((book) =>
              book.categories?.includes(category.name),
            );
            const isEven = index % 2 === 0;

            return (
              <section
                key={category.id}
                className={`w-full py-12 sm:py-16 px-4 ${
                  isEven ? "bg-white" : "bg-violet-50/30"
                }`}
              >
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div className="max-w-2xl">
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                        {category.name}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {booksInCategory.length}{" "}
                        {booksInCategory.length === 1 ? "book" : "books"}
                      </p>
                    </div>
                    <Link
                      to={`/categories/${category.id}`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-100 text-violet-700 hover:bg-violet-200 font-medium rounded-lg transition-colors shrink-0"
                    >
                      View more
                      <ArrowRight size={18} />
                    </Link>
                  </div>

                  {booksInCategory.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
                      {booksInCategory.slice(0, 5).map((book) => (
                        <BookCard key={book.id} book={book} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      No books in this category yet.
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
