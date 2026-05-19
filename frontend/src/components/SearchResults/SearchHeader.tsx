type SearchHeaderProps = {
  query: string;
};

export default function SearchHeader({ query }: SearchHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Search results</h1>
      <p className="text-sm text-gray-600 mt-1">
        Query: <span className="font-semibold">{query || "(empty)"}</span>
      </p>
    </div>
  );
}
