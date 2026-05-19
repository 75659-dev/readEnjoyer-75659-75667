import type { Book as ApiBook } from "../services/books.service";
import type { Book } from "../components/BookCard";
import { getFileUrl } from "./files";

const coverColors = ["#a78bfa", "#d8b4fe", "#c084fc", "#e879f9", "#b794f6"];

export function getAverageRating(book: ApiBook) {
  if (!book.reviews?.length) {
    return 0;
  }

  const total = book.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / book.reviews.length).toFixed(1));
}

export function mapApiBook(book: ApiBook, index = 0): Book {
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
