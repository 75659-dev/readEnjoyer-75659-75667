import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageContainer from "../components/common/PageContainer";
import { authService } from "../services/auth.service";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("");
      setError("Verification token is missing.");
      return;
    }

    let timeoutId: number | undefined;

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("Email verified successfully.");
        timeoutId = window.setTimeout(() => {
          navigate("/", { replace: true });
        }, 1200);
      })
      .catch((err) => {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message
          : undefined;
        setStatus("");
        setError(
          Array.isArray(message)
            ? message.join(" ")
            : message || "Email verification failed.",
        );
      });

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [navigate, searchParams]);

  return (
    <PageContainer containerClassName="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Email verification
        </h1>

        {status && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
            {status}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        {error && (
          <Link
            to="/login"
            className="inline-flex justify-center mt-6 px-4 py-2 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          >
            Back to login
          </Link>
        )}
      </div>
    </PageContainer>
  );
}
