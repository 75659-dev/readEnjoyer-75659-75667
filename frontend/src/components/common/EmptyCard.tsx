import type { ReactNode } from "react";

type EmptyCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export default function EmptyCard({
  title,
  description,
  icon,
}: EmptyCardProps) {
  return (
    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
      {icon ? (
        <div className="mx-auto h-12 w-12 text-gray-300 mb-4">{icon}</div>
      ) : null}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-500">{description}</p>
    </div>
  );
}
