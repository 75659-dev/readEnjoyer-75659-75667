import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import { booksService, type Book as ApiBook } from "../services/books.service";
import { authorsService, type Author } from "../services/authors.service";
import {
  categoriesService,
  type Category,
} from "../services/categories.service";
import { adminService } from "../services/admin.service";
import { filesService } from "../services/files.service";
import { getFileUrl } from "../utils/files";

export default function AdminDashboard() {
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newAuthor, setNewAuthor] = useState({ name: "", bio: "", image: "" });
  const [newCategory, setNewCategory] = useState("");
  const [isAuthorImageUploading, setIsAuthorImageUploading] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  async function loadDashboard() {
    const [booksData, authorsData, categoriesData] = await Promise.all([
      booksService.getAll(),
      authorsService.getAll(),
      categoriesService.getAll(),
    ]);
    setBooks(booksData);
    setAuthors(authorsData);
    setCategories(categoriesData);
    setIsLoading(false);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(
    () => [
      { label: "Books", value: books.length },
      { label: "Authors", value: authors.length },
      { label: "Categories", value: categories.length },
      {
        label: "Reviews",
        value: books.reduce(
          (sum, book) => sum + (book.reviews?.length || 0),
          0,
        ),
      },
    ],
    [authors.length, books, categories.length],
  );

  async function handleDeleteBook(id: string | number) {
    if (!confirm("Delete this book? This action cannot be undone.")) return;
    setIsProcessingAction(true);
    try {
      await booksService.remove(id);
      await loadDashboard();
      setStatus("Book deleted.");
    } catch (err) {
      setStatus((err as any)?.message || "Failed to delete book.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleCreateAuthor(e: React.FormEvent) {
    e.preventDefault();
    if (!newAuthor.name.trim()) return;
    setIsProcessingAction(true);
    try {
      await authorsService.create({
        name: newAuthor.name.trim(),
        bio: newAuthor.bio.trim() || undefined,
        image: newAuthor.image.trim() || undefined,
      });
      setNewAuthor({ name: "", bio: "", image: "" });
      await loadDashboard();
      setStatus("Author created.");
    } catch (err) {
      setStatus((err as any)?.message || "Failed to create author.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleAuthorImageUpload(file?: File) {
    if (!file) return;
    setIsAuthorImageUploading(true);
    try {
      const result = await filesService.upload(file);
      setNewAuthor((current) => ({ ...current, image: result.fileId }));
    } catch (err) {
      setStatus((err as any)?.message || "Failed to upload image.");
    } finally {
      setIsAuthorImageUploading(false);
    }
  }

  async function handleDeleteAuthor(id: number) {
    if (!confirm("Delete this author?")) return;
    setIsProcessingAction(true);
    try {
      await authorsService.remove(id);
      await loadDashboard();
      setStatus("Author deleted.");
    } catch (err) {
      setStatus((err as any)?.message || "Failed to delete author.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setIsProcessingAction(true);
    try {
      await categoriesService.create(newCategory.trim());
      setNewCategory("");
      await loadDashboard();
      setStatus("Category created.");
    } catch (err) {
      setStatus((err as any)?.message || "Failed to create category.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;
    setIsProcessingAction(true);
    try {
      await categoriesService.remove(id);
      await loadDashboard();
      setStatus("Category deleted.");
    } catch (err) {
      setStatus((err as any)?.message || "Failed to delete category.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleSeed() {
    setIsProcessingAction(true);
    try {
      const result = await adminService.seedFakeData();
      setStatus(result.message || "Seeding complete.");
      await loadDashboard();
    } catch (err) {
      setStatus((err as any)?.message || "Failed to seed data.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  async function handleHealthCheck() {
    setIsProcessingAction(true);
    try {
      await adminService.checkDatabase();
      setStatus("Database connection is healthy.");
    } catch (err) {
      setStatus((err as any)?.message || "Health check failed.");
    } finally {
      setIsProcessingAction(false);
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <PageHeader title="Admin Dashboard" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleHealthCheck}
            className="border border-violet-200 text-violet-700 px-4 py-2 rounded text-sm font-semibold"
            disabled={isProcessingAction}
          >
            Check DB
          </button>
          <button
            onClick={handleSeed}
            className="border border-violet-200 text-violet-700 px-4 py-2 rounded text-sm font-semibold"
            disabled={isProcessingAction}
          >
            Seed fake data
          </button>
          <Link
            to="/admin/books/new"
            className="bg-violet-600 text-white px-4 py-2 rounded text-sm font-semibold"
          >
            Add new book
          </Link>
        </div>
      </div>

      {status && (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {status}
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading admin data...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} />
            ))}
          </section>

          <section className="border rounded-lg p-4 bg-white shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Books</h2>
              <Link to="/books" className="text-sm text-violet-600">
                View catalog
              </Link>
            </div>
            <div className="divide-y">
              {books.slice(0, 8).map((book) => (
                <div
                  key={book.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-semibold">{book.title}</div>
                    <div className="text-xs text-gray-500">
                      {typeof book.author === "object"
                        ? book.author.name
                        : book.author}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700">${book.price}</div>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Authors</h2>
              <form onSubmit={handleCreateAuthor} className="space-y-2 mb-4">
                <input
                  value={newAuthor.name}
                  onChange={(e) =>
                    setNewAuthor({ ...newAuthor, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Author name"
                />
                <input
                  value={newAuthor.bio}
                  onChange={(e) =>
                    setNewAuthor({ ...newAuthor, bio: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Bio"
                />
                {newAuthor.image && (
                  <div className="h-24 w-24 overflow-hidden rounded-full border bg-gray-50">
                    <img
                      src={getFileUrl(newAuthor.image) || ""}
                      alt="Author preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Author image upload"
                  onChange={(e) => handleAuthorImageUpload(e.target.files?.[0])}
                  className="w-full text-sm"
                  disabled={isAuthorImageUploading || isProcessingAction}
                />
                {isAuthorImageUploading && (
                  <div className="text-sm text-gray-500">
                    Uploading author image...
                  </div>
                )}
                <button
                  className="bg-violet-600 text-white px-3 py-2 rounded text-sm"
                  disabled={isProcessingAction}
                >
                  Create author
                </button>
              </form>
              <div className="divide-y">
                {authors.map((author) => (
                  <div
                    key={author.id}
                    className="py-2 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-gray-700">{author.name}</span>
                    <button
                      onClick={() => handleDeleteAuthor(author.id)}
                      className="text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Categories</h2>
              <form onSubmit={handleCreateCategory} className="flex gap-2 mb-4">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Category name"
                />
                <button
                  className="bg-violet-600 text-white px-3 py-2 rounded text-sm"
                  disabled={isProcessingAction}
                >
                  Create
                </button>
              </form>
              <div className="divide-y">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="py-2 flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-gray-700">
                      {category.name}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}
