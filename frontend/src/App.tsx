import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Catalog from "./pages/Catalog";
import BookDetails from "./pages/BookDetails";
import AuthorDetails from "./pages/AuthorDetails";
import Authors from "./pages/Authors";
import CategoryBooks from "./pages/CategoryBooks";
import SearchResults from "./pages/SearchResults";
import MyProfile from "./pages/MyProfile";
import UserProfile from "./pages/UserProfile";
import MyLibrary from "./pages/MyLibrary";
import AdminDashboard from "./pages/AdminDashboard";
import CreateBook from "./pages/CreateBook";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";
import Layout from "./components/Layout";
import Categories from "./pages/Categories";

function App() {
  return (
    <Routes>
      {/* Wrap all routes in a Layout component for shared UI */}
      <Route path="/" element={<Layout />}>
        {/* 🟢 PUBLIC ROUTES */}
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="auth/verify-email" element={<VerifyEmail />} />
        <Route path="books" element={<Catalog />} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="authors" element={<Authors />} />
        <Route path="authors/:id" element={<AuthorDetails />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:id" element={<CategoryBooks />} />
        <Route path="search" element={<SearchResults />} />

        {/* 🔴 PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<MyProfile />} />
          <Route path="users/:id" element={<UserProfile />} />
          <Route path="library" element={<MyLibrary />} />
        </Route>

        {/* 🛡️ ADMIN ROUTES */}
        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboard />} />
          <Route path="books/new" element={<CreateBook />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
