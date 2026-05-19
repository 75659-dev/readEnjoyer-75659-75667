import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { User as UserIcon } from "lucide-react";
import type { Book } from "../components/BookCard";
import SearchHeader from "../components/SearchResults/SearchHeader";
import FilterSidebar, {
  type FilterItem,
  type FilterKey,
} from "../components/SearchResults/FilterSidebar";
import ResultsSection from "../components/SearchResults/ResultsSection";
import { booksService, type Book as ApiBook } from "../services/books.service";
import { authorsService, type Author } from "../services/authors.service";
import {
  categoriesService,
  type Category,
} from "../services/categories.service";
import { searchService } from "../services/search.service";
import { usersService } from "../services/users.service";
import { getFileUrl } from "../utils/files";

type SearchUser = Awaited<ReturnType<typeof usersService.search>>[number];

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

export default function SearchResults() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const query = (params.get("q") || "").trim().toLowerCase();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSearchData() {
      try {
        const [authorsData, categoriesData] = await Promise.all([
          authorsService.getAll(),
          categoriesService.getAll(),
        ]);
        setAuthors(authorsData);
        setCategories(categoriesData);
      } catch {
        setError("Failed to load search data.");
      } finally {
        setIsLoading(false);
      }
    }

    loadSearchData();
  }, []);

  useEffect(() => {
    async function runSearch() {
      if (!query) {
        setBooks([]);
        setUsers([]);
        return;
      }

      try {
        const [booksData, usersData] = await Promise.all([
          searchService.searchBooks(query),
          usersService.search(query),
        ]);
        setBooks(booksData.map(mapBook));
        setUsers(usersData);
      } catch {
        try {
          const fallback = await booksService.getAll();
          setBooks(
            fallback
              .map(mapBook)
              .filter(
                (book) =>
                  book.title.toLowerCase().includes(query) ||
                  book.author.toLowerCase().includes(query) ||
                  book.categories?.some((category) =>
                    category.toLowerCase().includes(query),
                  ),
              ),
          );
        } catch {
          setError("Failed to search books.");
        }
      }
    }

    runSearch();
  }, [query]);

  const filtered = useMemo(() => {
    if (!query) {
      return { books: [], authors: [], users: [], categories: [] };
    }
    const includes = (value: string) => value.toLowerCase().includes(query);

    return {
      books,
      authors: authors.filter(
        (a) => includes(a.name) || includes(a.bio || ""),
      ),
      users,
      categories: categories.filter((c) => includes(c.name)),
    };
  }, [authors, books, categories, query]);

  const hasResults =
    filtered.books.length ||
    filtered.authors.length ||
    filtered.users.length ||
    filtered.categories.length;

  const filterItems: FilterItem[] = [
    {
      key: "all",
      label: "All",
      count:
        filtered.books.length +
        filtered.authors.length +
        filtered.users.length +
        filtered.categories.length,
    },
    { key: "books", label: "Books", count: filtered.books.length },
    { key: "authors", label: "Authors", count: filtered.authors.length },
    { key: "users", label: "Users", count: filtered.users.length },
    {
      key: "categories",
      label: "Categories",
      count: filtered.categories.length,
    },
  ];

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <SearchHeader query={query} />

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <FilterSidebar
            filter={filter}
            items={filterItems}
            onChange={setFilter}
          />

          <div>
            {isLoading ? (
              <p className="text-gray-600">Loading search data...</p>
            ) : error ? (
              <div className="rounded-lg bg-red-50 p-4 text-red-600">
                {error}
              </div>
            ) : !query ? (
              <p className="text-gray-600">
                Type a search query to see results.
              </p>
            ) : !hasResults ? (
              <div className="rounded-lg bg-gray-50 p-4 text-gray-600">
                No results found.
              </div>
            ) : (
              <div className="space-y-6">
                {(filter === "all" || filter === "books") && (
                  <ResultsSection
                    title="Books"
                    emptyText="No books found."
                    isEmpty={filtered.books.length === 0}
                  >
                    <ul className="divide-y rounded-lg bg-gray-50">
                      {filtered.books.map((b) => (
                        <li key={b.id} className="p-3 hover:bg-white">
                          <Link to={`/books/${b.id}`} className="block">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-violet-200">
                                  {b.coverUrl ? (
                                    <img
                                      src={b.coverUrl}
                                      alt={b.title}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div
                                      className="h-full w-full"
                                      style={{ backgroundColor: b.coverColor }}
                                    />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold truncate">
                                    {b.title}
                                  </div>
                                  <div className="text-xs text-gray-600 truncate">
                                    {b.author}
                                  </div>
                                  {b.categories && b.categories.length > 0 && (
                                    <div className="text-xs text-violet-600 truncate">
                                      {b.categories
                                        .map((category) => `#${category}`)
                                        .join(" ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 shrink-0">
                                ⭐ {b.rating}
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </ResultsSection>
                )}

                {(filter === "all" || filter === "authors") && (
                  <ResultsSection
                    title="Authors"
                    emptyText="No authors found."
                    isEmpty={filtered.authors.length === 0}
                  >
                    <ul className="divide-y rounded-lg bg-gray-50">
                      {filtered.authors.map((a) => {
                        const imageUrl = getFileUrl(a.image);

                        return (
                          <li key={a.id} className="p-3 hover:bg-white">
                            <Link to={`/authors/${a.id}`} className="block">
                              <div className="flex items-center gap-3">
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-violet-200 flex items-center justify-center">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={a.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <UserIcon size={22} className="text-white" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold truncate">
                                    {a.name}
                                  </div>
                                  <div className="text-xs text-gray-600 line-clamp-2">
                                    {a.bio || "No biography available yet."}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </ResultsSection>
                )}

                {(filter === "all" || filter === "users") && (
                  <ResultsSection
                    title="Users"
                    emptyText="No users found."
                    isEmpty={filtered.users.length === 0}
                  >
                    <ul className="divide-y rounded-lg bg-gray-50">
                      {filtered.users.map((u) => (
                        <li key={u.id} className="p-3 hover:bg-white">
                          <Link to={`/users/${u.id}`} className="block">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-violet-200 flex items-center justify-center">
                                {u.avatar ? (
                                  <img
                                    src={getFileUrl(u.avatar) || ""}
                                    alt={u.username}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <UserIcon size={20} className="text-white" />
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-semibold">
                                  {u.username}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {u._count.library} books • {u._count.reviews}{" "}
                                  reviews
                                </div>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </ResultsSection>
                )}

                {(filter === "all" || filter === "categories") && (
                  <ResultsSection
                    title="Categories"
                    emptyText="No categories found."
                    isEmpty={filtered.categories.length === 0}
                  >
                    <ul className="divide-y rounded-lg bg-gray-50">
                      {filtered.categories.map((c) => (
                        <li key={c.id} className="p-3 hover:bg-white">
                          <Link to={`/categories/${c.id}`} className="block">
                            <div className="text-sm font-semibold">
                              {c.name}
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </ResultsSection>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
