import { Link } from "react-router-dom";
import PageContainer from "../components/common/PageContainer";

export default function NotFound() {
  return (
    <PageContainer
      className="bg-white p-6 flex items-center justify-center"
      containerClassName="max-w-lg text-center"
    >
      <div className="text-7xl font-extrabold text-violet-600">404</div>
      <h1 className="text-2xl font-bold mt-4">Page not found</h1>
      <p className="text-gray-600 mt-2">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link
          to="/"
          className="bg-violet-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-violet-700 transition-colors"
        >
          Go home
        </Link>
        <Link
          to="/books"
          className="border border-gray-200 px-5 py-2 rounded-full text-sm font-semibold text-gray-700 hover:border-gray-300 transition-colors"
        >
          Browse books
        </Link>
      </div>
    </PageContainer>
  );
}
