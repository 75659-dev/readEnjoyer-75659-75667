import { useEffect, useMemo, useState } from "react";
import { BookCard, type Book } from "../components/BookCard";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import SectionHeader from "../components/common/SectionHeader";
import EmptyState from "../components/common/EmptyState";
import {
  libraryService,
  type ReadingStatus,
} from "../services/library.service";
import { mapApiBook } from "../utils/bookMapping";

type LibraryBook = Book & {
  status: ReadingStatus;
  pagesRead: number;
};

function statusLabel(status: ReadingStatus) {
  if (status === "WANT_TO_READ") return "Want to read";
  if (status === "READING") return "Reading";
  return "Read";
}

export default function MyLibrary() {
  const [items, setItems] = useState<LibraryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadLibrary() {
    try {
      const data = await libraryService.getMine();
      setItems(
        data.map((item, index) => ({
          ...mapApiBook(item.book, index),
          status: item.status,
          pagesRead: item.pagesRead,
        })),
      );
    } catch {
      setError("Failed to load your library.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLibrary();
  }, []);

  async function updateStatus(id: number, status: ReadingStatus) {
    await libraryService.updateBook(id, { status });
    await loadLibrary();
  }

  async function removeItem(id: number) {
    await libraryService.removeBook(id);
    await loadLibrary();
  }

  const grouped = useMemo(
    () => ({
      want: items.filter((i) => i.status === "WANT_TO_READ"),
      reading: items.filter((i) => i.status === "READING"),
      read: items.filter((i) => i.status === "READ"),
    }),
    [items],
  );

  function renderBooks(books: LibraryBook[], emptyText: string) {
    if (books.length === 0) {
      return <EmptyState message={emptyText} />;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="relative">
            <BookCard book={book} />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {(["WANT_TO_READ", "READING", "READ"] as ReadingStatus[])
                  .filter((status) => status !== book.status)
                  .map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(book.id, status)}
                      className="text-sm px-2 py-1 bg-gray-100 rounded"
                    >
                      {statusLabel(status)}
                    </button>
                  ))}
              </div>
              <button
                onClick={() => removeItem(book.id)}
                className="text-sm text-red-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="My Library" />

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading library...</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <>
          <section className="mb-8">
            <SectionHeader title="Want to read" />
            {renderBooks(grouped.want, "No books in this list.")}
          </section>

          <section className="mb-8">
            <SectionHeader title="Reading" />
            {renderBooks(grouped.reading, "No books in this list.")}
          </section>

          <section>
            <SectionHeader title="Read" />
            {renderBooks(grouped.read, "No books in this list.")}
          </section>
        </>
      )}
    </PageContainer>
  );
}
