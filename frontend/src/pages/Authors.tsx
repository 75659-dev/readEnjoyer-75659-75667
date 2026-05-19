import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, ArrowRight } from "lucide-react";
import PageContainer from "../components/common/PageContainer";
import PageHeader from "../components/common/PageHeader";
import EmptyCard from "../components/common/EmptyCard";
import { authorsService, type Author } from "../services/authors.service";
import { getFileUrl } from "../utils/files";

const avatarColors = ["#f472b6", "#60a5fa", "#fbbf24", "#34d399", "#a78bfa"];

export default function Authors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAuthors() {
      try {
        const data = await authorsService.getAll();
        setAuthors(data);
      } catch {
        setError("Failed to load authors.");
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthors();
  }, []);

  return (
    <PageContainer>
      <PageHeader title="Authors" />

      {isLoading ? (
        <div className="text-sm text-gray-500">Loading authors...</div>
      ) : error ? (
        <EmptyCard title="Authors unavailable" description={error} icon={<User />} />
      ) : authors.length === 0 ? (
        <EmptyCard
          title="No authors found"
          description="There are no authors in the catalog yet."
          icon={<User />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {authors.map((author, index) => {
            const imageUrl = getFileUrl(author.image);

            return (
              <Link
                to={`/authors/${author.id}`}
                key={author.id}
                className="group flex flex-col rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-full aspect-[3/2] flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={48} className="text-white/70" />
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm group-hover:text-violet-600">
                    {author.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                    {author.bio || "No biography available yet."}
                  </p>
                  <div className="mt-auto flex items-center justify-end">
                    <ArrowRight
                      size={14}
                      className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
