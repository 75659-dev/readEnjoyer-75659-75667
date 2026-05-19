import { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import { authorsService, type Author } from "../services/authors.service";
import {
  categoriesService,
  type Category,
} from "../services/categories.service";
import { booksService } from "../services/books.service";
import { filesService } from "../services/files.service";
import { getFileUrl } from "../utils/files";

type CreateBookForm = {
  title: string;
  description: string;
  price: string;
  stock: string;
  authorId: string;
  categoryIds: string[];
  image: string;
  pages: string;
  publishYear: string;
};

export default function CreateBook() {
  const [form, setForm] = useState<CreateBookForm>({
    title: "",
    description: "",
    price: "",
    stock: "",
    authorId: "",
    categoryIds: [],
    image: "",
    pages: "",
    publishYear: "",
  });
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCoverUploading, setIsCoverUploading] = useState(false);

  useEffect(() => {
    async function loadOptions() {
      const [authorsData, categoriesData] = await Promise.all([
        authorsService.getAll(),
        categoriesService.getAll(),
      ]);
      setAuthors(authorsData);
      setCategories(categoriesData);
      setForm((current) => ({
        ...current,
        authorId: current.authorId || String(authorsData[0]?.id || ""),
      }));
    }

    loadOptions();
  }, []);

  function validate() {
    const nextErrors: string[] = [];
    if (!form.title.trim()) nextErrors.push("Title is required.");
    if (form.price === "" || Number(form.price) < 0)
      nextErrors.push("Price must be 0 or greater.");
    if (form.stock === "" || Number(form.stock) < 0)
      nextErrors.push("Stock must be 0 or greater.");
    if (form.authorId === "" || Number(form.authorId) <= 0)
      nextErrors.push("Author is required.");
    setErrors(nextErrors);
    return nextErrors.length === 0;
  }

  async function handleCoverUpload(file?: File) {
    if (!file) return;
    setErrors([]);
    setIsCoverUploading(true);
    try {
      const result = await filesService.upload(file);
      setForm((current) => ({ ...current, image: result.fileId }));
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setErrors([
        Array.isArray(message)
          ? message.join(" ")
          : message || "Failed to upload cover image.",
      ]);
    } finally {
      setIsCoverUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess("");
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await booksService.create({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        price: Number(form.price),
        stock: Number(form.stock),
        authorId: Number(form.authorId),
        categoryIds: form.categoryIds.map(Number),
        image: form.image.trim() || undefined,
        pages: form.pages ? Number(form.pages) : undefined,
        publishYear: form.publishYear ? Number(form.publishYear) : undefined,
      });
      setSuccess("Book created successfully.");
      setForm({
        title: "",
        description: "",
        price: "",
        stock: "",
        authorId: String(authors[0]?.id || ""),
        categoryIds: [],
        image: "",
        pages: "",
        publishYear: "",
      });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;
      setErrors([
        Array.isArray(message)
          ? message.join(" ")
          : message || "Failed to create book.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer containerClassName="max-w-3xl mx-auto">
      <PageHeader title="Create new book" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Price"
            required
          />
          <input
            type="number"
            min={0}
            step="1"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Stock"
            required
          />
          <input
            type="number"
            min={0}
            step="1"
            value={form.pages}
            onChange={(e) => setForm({ ...form, pages: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Pages"
          />
          <input
            type="number"
            min={0}
            step="1"
            value={form.publishYear}
            onChange={(e) => setForm({ ...form, publishYear: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Publish year"
          />
        </div>

        <select
          value={form.authorId}
          onChange={(e) => setForm({ ...form, authorId: e.target.value })}
          className="w-full border rounded px-3 py-2"
          required
        >
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.categoryIds.includes(String(category.id))}
                onChange={(e) => {
                  const id = String(category.id);
                  setForm((current) => ({
                    ...current,
                    categoryIds: e.target.checked
                      ? [...current.categoryIds, id]
                      : current.categoryIds.filter((item) => item !== id),
                  }));
                }}
              />
              {category.name}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover image
          </label>
          {form.image && (
            <div className="mb-3 h-40 w-28 overflow-hidden rounded-lg border bg-gray-50">
              <img
                src={getFileUrl(form.image) || ""}
                alt="Book cover preview"
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleCoverUpload(e.target.files?.[0])}
            className="w-full text-sm"
          />
          {isCoverUploading && (
            <div className="mt-2 text-sm text-gray-500">Uploading cover...</div>
          )}
        </div>

        {errors.length > 0 && (
          <div className="border border-red-200 bg-red-50 text-red-700 rounded p-3 text-sm">
            {errors.join(" ")}
          </div>
        )}

        {success && (
          <div className="border border-green-200 bg-green-50 text-green-700 rounded p-3 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-violet-600 text-white px-5 py-2 rounded text-sm font-semibold"
        >
          {isSubmitting ? "Creating..." : "Create book"}
        </button>
      </form>
    </PageContainer>
  );
}
