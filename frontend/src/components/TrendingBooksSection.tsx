import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight } from "lucide-react";
import { BookCard, type Book } from "./BookCard";

interface TrendingBooksSectionProps {
  books: Book[];
  isLoading?: boolean;
  error?: string;
}

export function TrendingBooksSection({
  books,
  isLoading = false,
  error = "",
}: TrendingBooksSectionProps) {
  return (
    <section className="bg-gradient-to-br from-violet-100/40 to-purple-100/40 py-16 px-4 sm:py-24 border-t border-b border-violet-200/30">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm mb-2">
            <TrendingUp size={18} />
            TRENDING
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Currently Reading
          </h2>
          <p className="text-gray-600 mt-2">
            Most popular books in our community
          </p>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-500">Loading books...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No books available yet.</div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-violet-600 text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition-colors"
          >
            View all books
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
