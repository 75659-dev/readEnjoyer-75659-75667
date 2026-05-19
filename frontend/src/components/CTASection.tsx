import { useNavigate } from "react-router-dom";

export function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-r from-violet-600 to-purple-600 py-16 px-4 sm:py-20">
      <div className="max-w-3xl mx-auto text-center text-white">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to get started?
        </h2>
        <p className="text-lg opacity-90 mb-8">
          Join thousands of book lovers and find your next favorite read.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="px-8 py-3 bg-white text-violet-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
        >
          Sign up for free
        </button>
      </div>
    </section>
  );
}
