import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-violet-50 via-white to-purple-50 py-20 px-4 sm:py-28">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold">
          <Sparkles size={16} />
          Social network for book lovers
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
          Discover new <span className="text-violet-600">worlds</span> with
          ReadEnjoyer
        </h1>

        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join the community of book lovers. Find great books, read reviews, and
          create your own shelves.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => navigate("/books")}
            className="px-8 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Browse catalog
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 border-2 border-violet-600 text-violet-600 font-semibold rounded-lg hover:bg-violet-50 transition-colors"
          >
            Join
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Over <span className="font-semibold text-gray-700">12,000+</span>{" "}
          readers have chosen ReadEnjoyer
        </p>
      </div>
    </section>
  );
}
