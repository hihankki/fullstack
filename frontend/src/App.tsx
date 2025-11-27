import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { RecentReviews } from "./components/RecentReviews";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { MyReviews } from "./components/MyReviews";
import { CreateReview } from "./components/CreateReview";
import { SearchReview } from "./components/SearchReview";
import type { Review, Page } from "./types";

const API_URL = "http://localhost:8000";

type UserRole = "guest" | "user" | "admin";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("recent");

  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem("access_token")
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("Гость");
  const [userRole, setUserRole] = useState<UserRole>("guest");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // загрузка отзывов
  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);
    try {
      const res = await fetch(`${API_URL}/api/reviews/`);
      if (!res.ok) {
        throw new Error("Не удалось загрузить отзывы");
      }
      const data = await res.json();
      const mapped: Review[] = data.map((r: any) => ({
        id: r.id,
        author: r.author,
        rating: r.rating,
        date: new Date(r.created_at).toLocaleString("ru-RU"),
        title: r.title,
        text: r.content,
        category: "Другое",
        isUserReview: false, // уточним ниже
      }));
      setReviews(mapped);
    } catch (err) {
      setReviewsError(
        err instanceof Error ? err.message : "Ошибка загрузки отзывов"
      );
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // проверяем токен -> /me
  useEffect(() => {
    const checkMe = async () => {
      if (!authToken) {
        setIsLoggedIn(false);
        setCurrentUser("Гость");
        setUserRole("guest");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!res.ok) {
          setIsLoggedIn(false);
          setCurrentUser("Гость");
          setUserRole("guest");
          setAuthToken(null);
          localStorage.removeItem("access_token");
          return;
        }
        const data = await res.json();
        setIsLoggedIn(true);
        setCurrentUser(data.full_name ?? data.username);
        const role = (data.role as "user" | "admin") ?? "user";
        setUserRole(role);
      } catch {
        setIsLoggedIn(false);
        setCurrentUser("Гость");
        setUserRole("guest");
      }
    };

    checkMe();
  }, [authToken]);

  // пересчитываем isUserReview (для админа – все отзывы его)
  useEffect(() => {
    setReviews((prev) =>
      prev.map((r) => ({
        ...r,
        isUserReview:
          userRole === "admin"
            ? true
            : currentUser !== "Гость" && r.author === currentUser,
      }))
    );
  }, [currentUser, userRole]);

  // логин
  const handleLogin = async (username: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const body = new URLSearchParams();
      body.append("username", username);
      body.append("password", password);

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Ошибка авторизации");
      }

      const data = await res.json();
      setAuthToken(data.access_token);
      localStorage.setItem("access_token", data.access_token);
      setCurrentPage("my-reviews");
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Ошибка авторизации"
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // регистрация
  const handleRegister = async (
    username: string,
    password: string,
    fullName: string
  ) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          full_name: fullName,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Ошибка регистрации");
      }

      // после регистрации сразу логиним
      await handleLogin(username, password);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Ошибка регистрации"
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("Гость");
    setUserRole("guest");
    setAuthToken(null);
    localStorage.removeItem("access_token");
    setCurrentPage("recent");
  };

  // создание отзыва
  const handleCreateReview = async (
    rating: number,
    title: string,
    text: string,
    category: string
  ) => {
    if (!authToken) {
      setCreateError("Необходима авторизация");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await fetch(`${API_URL}/api/reviews/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title,
          content: text,
          rating,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        let msg = "Не удалось создать отзыв";

        if (Array.isArray(data?.detail)) {
          msg = data.detail
            .map((d: any) => d.msg || d.detail || "")
            .filter(Boolean)
            .join("; ");
        } else if (typeof data?.detail === "string") {
          msg = data.detail;
        }

        throw new Error(msg);
      }

      const data = await res.json();
      const newReview: Review = {
        id: data.id,
        author: data.author,
        rating: data.rating,
        date: new Date(data.created_at).toLocaleString("ru-RU"),
        title: data.title,
        text: data.content,
        category,
        isUserReview: true,
      };

      setReviews((prev) => [newReview, ...prev]);
      setCurrentPage("my-reviews");
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Ошибка создания отзыва"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  // удаление отзыва
  const handleDeleteReview = async (reviewId: number) => {
    if (!authToken) {
      alert("Необходима авторизация");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.detail || "Не удалось удалить отзыв";
        throw new Error(msg);
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Ошибка при удалении отзыва"
      );
    }
  };

  const userReviews =
    userRole === "admin" ? reviews : reviews.filter((r) => r.isUserReview);

  return (
    <div className="min-h-screen bg-[#e8efe8]">
      <Header
        isLoggedIn={isLoggedIn}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {reviewsLoading && (
          <p className="mb-4 text-gray-600">Загрузка отзывов...</p>
        )}
        {reviewsError && (
          <p className="mb-4 text-red-500">Ошибка: {reviewsError}</p>
        )}

        {currentPage === "recent" && <RecentReviews reviews={reviews} />}

        {currentPage === "login" && (
          <LoginForm
            onLogin={handleLogin}
            loading={authLoading}
            error={authError}
          />
        )}

        {currentPage === "register" && (
          <RegisterForm
            onRegister={handleRegister}
            loading={authLoading}
            error={authError}
          />
        )}

        {currentPage === "my-reviews" && isLoggedIn && (
          <MyReviews
            reviews={userReviews}
            onNavigate={setCurrentPage}
            onDeleteReview={handleDeleteReview}
            isAdmin={userRole === "admin"}
          />
        )}

        {currentPage === "create" && isLoggedIn && (
          <CreateReview
            onCreateReview={handleCreateReview}
            loading={createLoading}
            error={createError}
          />
        )}

        {currentPage === "search" && <SearchReview reviews={reviews} />}
      </main>
    </div>
  );
}
