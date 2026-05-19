import { Link } from "react-router-dom";
import { Layers } from "lucide-react";

interface CategoriesSectionProps {
  categories: {
    id: number;
    name: string;
  }[];
  isLoading?: boolean;
  error?: string;
}

export function CategoriesSection({
  categories,
  isLoading = false,
  error = "",
}: CategoriesSectionProps) {
  return (
    <section className="bg-gradient-to-br from-violet-50/50 to-purple-50/50 py-16 px-4 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-2 text-violet-600 font-semibold text-sm mb-2">
            <Layers size={18} />
            GENRES
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Popular genres
          </h2>
          <p className="text-gray-600 mt-2">
            Pick what you love — and start an adventure
          </p>
        </div>

        {isLoading ? (
          <div className="text-center text-sm text-gray-500">Loading genres...</div>
        ) : error ? (
          <div className="text-center text-sm text-red-600">{error}</div>
        ) : categories.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className="px-6 py-3 bg-white border-2 border-violet-200 text-gray-700 font-semibold rounded-full hover:border-violet-400 hover:text-violet-600 transition-colors hover:shadow-md"
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500">
            No genres available yet.
          </div>
        )}
      </div>
    </section>
  );
}
