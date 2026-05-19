import { Link } from "react-router-dom";
import { Star, ArrowRight } from "lucide-react";

export interface Book {
  id: number;
  title: string;
  author: string;
  authorId?: number;
  rating: number;
  coverColor: string;
  coverUrl?: string | null;
  category?: string;
  categories?: string[];
}

export function BookCard({ book }: { book: Book }) {
  return (
    <Link
      to={`/books/${book.id}`}
      className="group flex flex-col rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-full aspect-[3/4] overflow-hidden">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="h-full w-full flex items-center justify-center"
            style={{ backgroundColor: book.coverColor }}
          >
            <div className="text-center text-white/30 px-4">
              <div className="text-sm font-bold">{book.title}</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-violet-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-gray-600">{book.author}</p>
        {book.categories && book.categories.length > 0 && (
          <p className="text-[11px] text-violet-600 font-medium line-clamp-1 mb-2">
            {book.categories.map((category) => `#${category}`).join(" ")}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-gray-700">
              {book.rating}
            </span>
          </div>
          <ArrowRight
            size={14}
            className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </Link>
  );
}
