import type { ReactNode } from "react";

type ResultsSectionProps = {
  title: string;
  emptyText: string;
  isEmpty: boolean;
  children: ReactNode;
};

export default function ResultsSection({
  title,
  emptyText,
  isEmpty,
  children,
}: ResultsSectionProps) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      {isEmpty ? (
        <p className="text-sm text-gray-600">{emptyText}</p>
      ) : (
        children
      )}
    </section>
  );
}
