import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { Header } from "./components/Header";
import { RecentReviews } from "./components/RecentReviews";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { MyReviews } from "./components/MyReviews";
import { CreateReview } from "./components/CreateReview";
import { SearchReview } from "./components/SearchReview";
import { RequireAuth, RequireRole } from "./components/RequireAuth";
import { AdminUsers } from "./pages/AdminUsers";
import { ReviewDetails } from "./pages/ReviewDetails";
import { SeoHead } from "./seo/SeoHead";

import type { Review, Page } from "./types";
import { useAuth } from "./auth/AuthContext";
import { apiFetch, getApiUrl, getFrontendUrl } from "./api/http";

type Role = "guest" | "user" | "admin";

const API_URL = getApiUrl();

function pageToPath(page: Page | "admin"): string {
  switch (page) {
    case "recent":
      return "/";
    case "login":
      return "/login";
    case "register":
      return "/register";
    case "my-reviews":
      return "/my";
    case "create":
      return "/create";
    case "search":
      return "/search";
    case "admin":
      return "/admin/users";
    default:
      return "/";
  }
}

function mapReview(r: any): Review {
  return {
    id: r.id,
    author: r.author,
    rating: r.rating,
    date: new Date(r.created_at).toLocaleString("ru-RU"),
    title: r.title,
    text: r.content,
    category: r.category,
    city: r.city,
    isUserReview: false,
    files: r.files || [],
    file_url: r.file_url || null,
  };
}

export default function App() {
  const navigate = useNavigate();
  const { isLoggedIn, role, fullName, login, logout, loading } = useAuth();
  const isAdmin = role === "admin";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const onNavigate = (page: Page | "admin") => navigate(pageToPath(page));

  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const res = await fetch(`${API_URL}/api/reviews/`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Не удалось загрузить отзывы");

      const data = await res.json();
      const mapped: Review[] = (data.items || []).map(mapReview);
      setReviews(mapped);
    } catch (e) {
      setReviewsError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    setReviews((prev) =>
      prev.map((r) => ({
        ...r,
        isUserReview: isAdmin ? true : fullName !== "Гость" && r.author === fullName,
      }))
    );
  }, [fullName, isAdmin]);

  const userReviews = useMemo(
    () => (isAdmin ? reviews : reviews.filter((r) => r.isUserReview)),
    [reviews, isAdmin]
  );

  const handleLogin = async (username: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await login(username, password);
      navigate("/my");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Ошибка входа");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (
    username: string,
    password: string,
    fullNameReg: string
  ) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          full_name: fullNameReg,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Ошибка регистрации");
      }

      await login(username, password);
      navigate("/my");
    } catch (e) {
      setAuthError(e instanceof Error ? e.message : "Ошибка регистрации");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateReview = async (
    rating: number,
    title: string,
    text: string,
    category: string,
    city: string,
    fileUrl?: string | null
  ) => {
    setCreateLoading(true);
    setCreateError(null);

    try {
      const res = await apiFetch("/api/reviews/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: text,
          rating,
          category,
          city,
          file_url: fileUrl ?? null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Не удалось создать отзыв");
      }

      const data = await res.json();
      const newReview: Review = {
        id: data.id,
        author: data.author,
        rating: data.rating,
        date: new Date(data.created_at).toLocaleString("ru-RU"),
        title: data.title,
        text: data.content,
        category: data.category,
        city: data.city,
        isUserReview: true,
        files: data.files || [],
        file_url: data.file_url || null,
      };

      setReviews((prev) => [newReview, ...prev]);
      navigate("/my");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Ошибка");
      throw e;
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const res = await apiFetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.detail || "Не удалось удалить");
      return;
    }

    setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  if (loading) {
    return (
      <HelmetProvider>
        <div className="p-6">Загрузка...</div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-[#f6fbf6]">
        <Header
          isLoggedIn={isLoggedIn}
          isAdmin={isAdmin}
          onNavigate={onNavigate}
          onLogout={() => logout()}
        />

        <main className="max-w-5xl mx-auto px-4 py-6">
          {reviewsLoading && <div>Загрузка отзывов...</div>}
          {reviewsError && <div className="text-red-600">Ошибка: {reviewsError}</div>}

          <Routes>
            <Route path="/" element={<RecentReviews reviews={reviews} />} />
            <Route path="/search" element={<SearchReview reviews={reviews} />} />
            <Route path="/reviews/:id" element={<ReviewDetails />} />

            <Route
              path="/login"
              element={
                <>
                  <SeoHead
                    title="Вход | GENTLECOMMENT"
                    description="Страница входа."
                    canonical={`${getFrontendUrl()}/login`}
                    noindex
                  />
                  <LoginForm
                    onLogin={handleLogin}
                    loading={authLoading}
                    error={authError}
                  />
                </>
              }
            />

            <Route
              path="/register"
              element={
                <>
                  <SeoHead
                    title="Регистрация | GENTLECOMMENT"
                    description="Страница регистрации."
                    canonical={`${getFrontendUrl()}/register`}
                    noindex
                  />
                  <RegisterForm
                    onRegister={handleRegister}
                    loading={authLoading}
                    error={authError}
                  />
                </>
              }
            />

            <Route
              path="/my"
              element={
                <RequireAuth isLoggedIn={isLoggedIn}>
                  <>
                    <SeoHead
                      title="Мои отзывы | GENTLECOMMENT"
                      description="Личный кабинет пользователя."
                      canonical={`${getFrontendUrl()}/my`}
                      noindex
                    />
                    <MyReviews
                      reviews={userReviews}
                      onNavigate={(p) => onNavigate(p)}
                      onDeleteReview={handleDeleteReview}
                      isAdmin={isAdmin}
                    />
                  </>
                </RequireAuth>
              }
            />

            <Route
              path="/create"
              element={
                <RequireAuth isLoggedIn={isLoggedIn}>
                  <>
                    <SeoHead
                      title="Создать отзыв | GENTLECOMMENT"
                      description="Создание нового отзыва."
                      canonical={`${getFrontendUrl()}/create`}
                      noindex
                    />
                    <CreateReview
                      onCreateReview={handleCreateReview}
                      loading={createLoading}
                      error={createError}
                    />
                  </>
                </RequireAuth>
              }
            />

            <Route
              path="/admin/users"
              element={
                <RequireAuth isLoggedIn={isLoggedIn}>
                  <RequireRole role={role as Role} allowed={["admin"]}>
                    <>
                      <SeoHead
                        title="Админка | GENTLECOMMENT"
                        description="Управление пользователями."
                        canonical={`${getFrontendUrl()}/admin/users`}
                        noindex
                      />
                      <AdminUsers />
                    </>
                  </RequireRole>
                </RequireAuth>
              }
            />

            <Route path="*" element={<RecentReviews reviews={reviews} />} />
          </Routes>
        </main>
      </div>
    </HelmetProvider>
  );
}