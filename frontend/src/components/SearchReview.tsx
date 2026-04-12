import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SimpleInput } from "./SimpleInput";
import { SimpleButton } from "./SimpleButton";
import { Search } from "./Icons";
import { ReviewCard } from "./ReviewCard";
import { ReviewModal } from "./ReviewModal";
import type { Review } from "../types";
import { getApiUrl } from "../api/http";

type SearchReviewProps = {
  reviews?: Review[];
};

const API_URL = getApiUrl();

function mapReview(r: any): Review {
  return {
    id: r.id,
    author: r.author,
    rating: r.rating,
    date: new Date(r.created_at).toLocaleString("ru-RU"),
    title: r.title,
    text: r.content,
    category: r.category,
    isUserReview: false,
    files: r.files || [],
  };
}

export function SearchReview({}: SearchReviewProps) {
  const [params, setParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [author, setAuthor] = useState(params.get("author") || "");
  const [ratingMin, setRatingMin] = useState(params.get("rating_min") || "");
  const [sortBy, setSortBy] = useState(params.get("sort_by") || "id");
  const [order, setOrder] = useState(params.get("order") || "desc");
  const [page, setPage] = useState(Number(params.get("page") || "1"));

  const [results, setResults] = useState<Review[]>([]);
  const [pages, setPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = (customPage?: number) => {
    const query = new URLSearchParams();

    const currentPage = customPage || page;

    if (searchQuery.trim()) query.set("q", searchQuery.trim());
    if (category.trim()) query.set("category", category.trim());
    if (author.trim()) query.set("author", author.trim());
    if (ratingMin.trim()) query.set("rating_min", ratingMin.trim());

    query.set("sort_by", sortBy);
    query.set("order", order);
    query.set("page", String(currentPage));
    query.set("limit", "5");

    return query;
  };

  const fetchReviews = async (customPage?: number) => {
    const query = buildQuery(customPage);

    setLoading(true);
    setError(null);

    try {
      setParams(query);

      const res = await fetch(`${API_URL}/api/reviews/?${query.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Не удалось выполнить поиск");
      }

      const data = await res.json();
      setResults((data.items || []).map(mapReview));
      setPages(data.pages || 1);
    } catch (e) {
      setResults([]);
      setPages(1);
      setError(e instanceof Error ? e.message : "Ошибка поиска");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchReviews(1);
  };

  const handleNext = async () => {
    if (page >= pages) return;
    const newPage = page + 1;
    setPage(newPage);
    await fetchReviews(newPage);
  };

  const handlePrev = async () => {
    if (page === 1) return;
    const newPage = page - 1;
    setPage(newPage);
    await fetchReviews(newPage);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[#c5d9c5] mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <SimpleInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по тексту..."
          />

          <SimpleInput
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Автор"
          />

          <SimpleInput
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Категория"
          />

          <SimpleInput
            type="number"
            min="1"
            max="5"
            value={ratingMin}
            onChange={(e) => setRatingMin(e.target.value)}
            placeholder="Мин. рейтинг (1-5)"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="id">ID</option>
            <option value="title">Название</option>
            <option value="rating">Рейтинг</option>
            <option value="author">Автор</option>
            <option value="category">Категория</option>
            <option value="created_at">Дата создания</option>
          </select>

          <select
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="desc">По убыванию</option>
            <option value="asc">По возрастанию</option>
          </select>

          <SimpleButton type="submit" className="flex items-center justify-center">
            <Search className="w-4 h-4 mr-2" />
            Искать
          </SimpleButton>
        </form>
      </div>

      {loading && <p className="text-center text-gray-500 mb-4">Загрузка...</p>}
      {error && <p className="text-center text-red-600 mb-4">{error}</p>}

      <div className="space-y-6">
        {results.length > 0 ? (
          results.map((review) => (
            <ReviewCard
              key={review.id}
              {...review}
              onClick={() => setSelectedReview(review)}
            />
          ))
        ) : (
          !loading && <p className="text-center text-gray-500">Отзывы не найдены</p>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <SimpleButton onClick={handlePrev} disabled={page === 1}>
          Назад
        </SimpleButton>

        <span>Страница {page} / {pages}</span>

        <SimpleButton onClick={handleNext} disabled={page >= pages}>
          Вперед
        </SimpleButton>
      </div>

      <ReviewModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </div>
  );
}