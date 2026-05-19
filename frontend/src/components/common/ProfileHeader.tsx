import type { ReactNode } from "react";
import { Shield } from "lucide-react";

type ProfileHeaderProps = {
  name: string;
  role: string;
  avatar: ReactNode;
  allowOverflow?: boolean;
};

export default function ProfileHeader({
  name,
  role,
  avatar,
  allowOverflow,
}: ProfileHeaderProps) {
  const overflowClass = allowOverflow ? "overflow-visible" : "overflow-hidden";
  return (
    <section className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
      <div
        className={`w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-2xl font-bold ${overflowClass}`}
      >
        {avatar}
      </div>
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <Shield size={16} className="text-gray-500" />
          <span className="capitalize">Role: {role}</span>
        </div>
      </div>
    </section>
  );
}
