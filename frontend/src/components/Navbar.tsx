import { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  LogOut,
  Settings,
  BookOpen,
  Library,
  Moon,
  Sun,
} from "lucide-react";
import { usersService } from "../services/users.service";
import type { User as AuthUser } from "../services/auth.service";
import { authService } from "../services/auth.service";
import { getFileUrl } from "../utils/files";

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );
  const { isAuthenticated, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated) {
        setProfile(null);
        return;
      }

      try {
        const data = await usersService.getMe();
        setProfile(data);
      } catch {
        setProfile(null);
      }
    }

    loadProfile();
    window.addEventListener("authChange", loadProfile);
    return () => window.removeEventListener("authChange", loadProfile);
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Catalog", path: "/books" },
    { name: "Authors", path: "/authors" },
    { name: "Categories", path: "/categories" },
  ];

  const avatarUrl = getFileUrl(profile?.avatar);
  const displayName = profile?.username || "User";
  const displayEmail = profile?.email || "";
  const isAdmin = profile?.role === "ADMIN";

  function toggleTheme() {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      localStorage.setItem("theme", next);
      return next;
    });
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-violet-600 text-white p-1.5 rounded-lg group-hover:bg-violet-700 transition-colors">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight group-hover:text-violet-700 transition-colors">
                ReadEnjoyer
              </span>
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: Search & Auth */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full border border-gray-200 bg-gray-50 text-gray-600 flex items-center justify-center hover:text-violet-600 hover:border-violet-300 transition-colors"
              aria-label={
                theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
              }
              title={
                theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
              }
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Search Bar */}
            <div className="hidden sm:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-gray-50 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            {/* Auth Controls */}
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-violet-300 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 border border-violet-200 overflow-hidden hover:bg-violet-200 transition-colors">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {displayEmail}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <Link
                        to="/library"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <Library size={16} />
                        My Library
                      </Link>
                    </div>
                    {isAdmin && (
                      <div className="py-1">
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          Admin Dashboard
                        </Link>
                      </div>
                    )}
                    <div className="py-1">
                      <button
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        onClick={async () => {
                          try {
                            await authService.logout();
                          } catch {
                            // Local logout still clears stale tokens if the server call fails.
                          }
                          logout();
                          setIsDropdownOpen(false);
                        }}
                      >
                        <LogOut size={16} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-violet-600 transition-colors px-2 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
