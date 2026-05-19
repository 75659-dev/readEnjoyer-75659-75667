type EmptyStateProps = {
  message: string;
  className?: string;
};

export default function EmptyState({ message, className }: EmptyStateProps) {
  return <p className={className || "text-gray-600"}>{message}</p>;
}
