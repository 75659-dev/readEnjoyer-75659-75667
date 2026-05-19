import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageContainer from "../components/common/PageContainer";
import SectionHeader from "../components/common/SectionHeader";
import ProfileHeader from "../components/common/ProfileHeader";
import StatCard from "../components/common/StatCard";
import EmptyState from "../components/common/EmptyState";
import { usersService } from "../services/users.service";
import { getFileUrl } from "../utils/files";

type PublicProfile = Awaited<ReturnType<typeof usersService.getPublicProfile>>;

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      if (!id) {
        setError("User id is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setProfile(await usersService.getPublicProfile(id));
      } catch {
        setError("Failed to load user profile.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="text-sm text-gray-500">Loading user profile...</div>
      </PageContainer>
    );
  }

  if (error || !profile) {
    return (
      <PageContainer>
        <h2 className="text-xl font-semibold">User not found</h2>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </PageContainer>
    );
  }

  const avatarUrl = getFileUrl(profile.avatar);

  return (
    <PageContainer>
      <ProfileHeader
        name={profile.username}
        role="user"
        avatar={
          avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.username}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            profile.username.slice(0, 1).toUpperCase()
          )
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard label="Books in library" value={profile._count.library} />
        <StatCard label="Reviews" value={profile._count.reviews} />
      </section>

      <section>
        <SectionHeader title="Public profile" />
        <p className="text-sm text-gray-600">
          Joined{" "}
          {profile.createdAt
            ? new Date(profile.createdAt).toLocaleDateString()
            : "recently"}
          .
        </p>
      </section>

      <section className="mt-8">
        <SectionHeader title="Reviews" />
        {profile.reviews.length === 0 ? (
          <EmptyState message="No reviews yet." />
        ) : (
          <div className="space-y-3">
            {profile.reviews.map((review) => {
              const coverUrl = getFileUrl(review.book.image);

              return (
                <div
                  key={review.id}
                  className="border rounded-lg bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-4">
                    <Link
                      to={`/books/${review.book.id}`}
                      className="h-24 w-16 shrink-0 overflow-hidden rounded bg-violet-200"
                    >
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={review.book.title}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/books/${review.book.id}`}
                            className="font-semibold hover:text-violet-600"
                          >
                            {review.book.title}
                          </Link>
                          {review.book.author && (
                            <div className="text-xs text-gray-500">
                              by{" "}
                              <Link
                                to={`/authors/${review.book.author.id}`}
                                className="hover:text-violet-600"
                              >
                                {review.book.author.name}
                              </Link>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-700">
                        {review.text || "No review text."}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Rating: {review.rating}/5
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
