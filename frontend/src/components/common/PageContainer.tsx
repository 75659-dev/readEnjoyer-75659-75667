import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export default function PageContainer({
  children,
  className,
  containerClassName,
}: PageContainerProps) {
  const mainClass = `min-h-screen ${className || "bg-white p-6"}`;
  const containerClass = containerClassName || "max-w-6xl mx-auto";

  return (
    <main className={mainClass}>
      <div className={containerClass}>{children}</div>
    </main>
  );
}
