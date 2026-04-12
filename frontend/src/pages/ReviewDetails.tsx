import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, getApiUrl, getFrontendUrl } from "../api/http";
import { SeoHead } from "../seo/SeoHead";
import { ExternalHeroImage } from "../components/ExternalHeroImage";
import type { Review } from "../types";
import { Star } from "../components/Icons";

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
    files: r.files || [],
  };
}

export function ReviewDetails() {
  const { id } = useParams();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const res = await fetch(`${API_URL}/api/reviews/${id}`, {
          credentials: "include",
        });

        if (res.status === 404) {
          if (mounted) setNotFound(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Не удалось загрузить отзыв");
        }

        const data = await res.json();
        if (mounted) {
          setReview(mapReview(data));
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Ошибка");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  const canonical = `${getFrontendUrl()}/reviews/${id}`;

  const jsonLd = useMemo(() => {
    if (!review) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      name: review.title,
      reviewBody: review.text,
      datePublished: new Date().toISOString(),
    };
  }, [review]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <SeoHead
          title="Загрузка отзыва"
          description="Загрузка страницы отзыва."
          canonical={canonical}
          noindex
        />
        <div className="p-6">Загрузка...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto">
        <SeoHead
          title="Отзыв не найден"
          description="Запрошенный отзыв не найден."
          canonical={canonical}
          noindex
        />
        <div className="bg-white rounded-xl border border-[#c5d9c5] p-8">
          <h1 className="text-2xl font-bold mb-3">404 — отзыв не найден</h1>
          <p className="text-gray-600 mb-4">
            Возможно, он был удалён или ссылка неверная.
          </p>
          <Link to="/" className="underline">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="max-w-4xl mx-auto">
        <SeoHead
          title="Ошибка загрузки отзыва"
          description="Не удалось загрузить страницу отзыва."
          canonical={canonical}
          noindex
        />
        <div className="bg-white rounded-xl border border-[#c5d9c5] p-8">
          <h1 className="text-2xl font-bold mb-3">Ошибка</h1>
          <p className="text-gray-600">{error || "Не удалось загрузить отзыв"}</p>
        </div>
      </div>
    );
  }

  const description = `${review.title} — отзыв категории ${review.category}, оценка ${review.rating}/5.`;

  return (
    <article className="max-w-4xl mx-auto">
      <SeoHead
        title={`${review.title} | GENTLECOMMENT`}
        description={description}
        canonical={canonical}
        jsonLd={jsonLd}
      />

      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-3">{review.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span className="px-3 py-1 rounded-full bg-[#edf5ed]">
            {review.category}
          </span>
          <span>Автор: {review.author}</span>
          <span>{review.date}</span>
        </div>
      </header>

      <ExternalHeroImage category={review.category} title={review.title} />

      <section className="bg-white rounded-xl border border-[#c5d9c5] p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Оценка</h2>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`w-6 h-6 ${
                index < review.rating
                  ? "fill-[#7fb87f] text-[#7fb87f]"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-[#c5d9c5] p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Текст отзыва</h2>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
          {review.text}
        </p>
      </section>

      <section className="bg-white rounded-xl border border-[#c5d9c5] p-6">
        <h2 className="text-xl font-semibold mb-4">Прикреплённые файлы</h2>

        {review.files && review.files.length > 0 ? (
          <div className="space-y-3">
            {review.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <div className="font-medium break-all">{file.filename}</div>
                  <div className="text-sm text-gray-500">
                    {file.content_type} · {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
                <a
                  href={`${API_URL}/uploads/${file.filename}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-[#7fb87f] text-white hover:bg-[#6ba66b]"
                >
                  Открыть
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Файлы не прикреплены.</p>
        )}
      </section>
    </article>
  );
}