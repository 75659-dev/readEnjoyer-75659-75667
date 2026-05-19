import { useState, useEffect } from "react";
import { Library } from "lucide-react";
import { BookCard, type Book } from "../components/BookCard";
import { CategorySidebar } from "../components/CategorySidebar";
import SearchInput from "../components/common/SearchInput";
import EmptyCard from "../components/common/EmptyCard";
import { booksService } from "../services/books.service";
import { categoriesService } from "../services/categories.service";
import type { Book as ApiBook } from "../services/books.service";
import { getFileUrl } from "../utils/files";

const coverColors = ["#a78bfa", "#d8b4fe", "#c084fc", "#e879f9", "#b794f6"];

function getAverageRating(book: ApiBook) {
  if (!book.reviews?.length) {
    return 0;
  }

  const total = book.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Number((total / book.reviews.length).toFixed(1));
}

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogBooks, setCatalogBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCatalogData() {
      try {
        const [booksData, categoriesData] = await Promise.all([
          booksService.getAll(),
          categoriesService.getAll(),
        ]);

        const mappedBooks: Book[] = booksData.map((book, index) => ({
          id: Number(book.id),
          title: book.title,
          author:
            typeof book.author === "object" ? book.author.name : book.author,
          authorId: typeof book.author === "object" ? book.author.id : undefined,
          rating: getAverageRating(book),
          coverColor: coverColors[index % coverColors.length],
          coverUrl: getFileUrl(book.image || book.coverUrl),
          category: book.categories?.[0]?.name,
          categories: book.categories?.map((category) => category.name) ?? [],
        }));

        setCatalogBooks(mappedBooks);
        setCategories([
          "All",
          ...categoriesData.map((category) => category.name),
        ]);
      } catch (error) {
        console.error("Failed to load books:", error);
        setError("Failed to load catalog data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalogData();
  }, []);

  const filteredBooks = catalogBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" || book.categories?.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <section className="bg-white border-b border-violet-100 py-8 px-4 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-violet-600 font-semibold text-sm mb-2">
                <Library size={18} />
                LIBRARY
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Book Catalog
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                Explore our vast collection of books. Search by title, author,
                or browse through our categories to find your next great read.
              </p>
            </div>

            <div className="w-full md:w-96">
              <SearchInput
                placeholder="Search books..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar / Filters */}
            <div className="w-full lg:w-64 shrink-0">
              <CategorySidebar
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
              />
            </div>

            {/* Book Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading catalog...</div>
              ) : error ? (
                <EmptyCard
                  title="Catalog unavailable"
                  description={error}
                  icon={<Library />}
                />
              ) : filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>
              ) : (
                <EmptyCard
                  title="No books found"
                  description="We couldn't find any books matching your search."
                  icon={<Library />}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
