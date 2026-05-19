import type { Book } from "../BookCard";
import { BookCard } from "../BookCard";

type BookGridProps = {
  books: Book[];
  className?: string;
};

export default function BookGrid({ books, className }: BookGridProps) {
  return (
    <div
      className={
        className || "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      }
    >
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
