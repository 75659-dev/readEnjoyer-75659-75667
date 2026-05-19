import { Filter } from "lucide-react";

interface CategorySidebarProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export function CategorySidebar({
  categories,
  activeCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-violet-100/50 p-6 sticky top-24">
      <div className="flex items-center gap-2 text-gray-900 font-semibold mb-6 pb-4 border-b border-gray-100">
        <Filter size={18} className="text-violet-500" />
        Categories
      </div>
      <div className="flex flex-col gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
              activeCategory === category
                ? "bg-violet-50 text-violet-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}