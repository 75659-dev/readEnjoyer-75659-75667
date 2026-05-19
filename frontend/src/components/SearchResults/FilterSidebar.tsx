type FilterKey = "all" | "books" | "authors" | "users" | "categories";

type FilterItem = {
  key: FilterKey;
  label: string;
  count: number;
};

type FilterSidebarProps = {
  filter: FilterKey;
  items: FilterItem[];
  onChange: (key: FilterKey) => void;
};

export default function FilterSidebar({
  filter,
  items,
  onChange,
}: FilterSidebarProps) {
  return (
    <aside className="rounded-lg p-4 bg-gray-50 h-fit">
      <div className="text-sm font-semibold text-gray-700 mb-3">Filter by</div>
      <div className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`flex items-center justify-between rounded-full px-3 py-1.5 text-sm transition-colors ${
              filter === item.key
                ? "bg-violet-100 text-violet-700"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <span>{item.label}</span>
            <span className="text-xs text-gray-500">{item.count}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export type { FilterKey, FilterItem };
