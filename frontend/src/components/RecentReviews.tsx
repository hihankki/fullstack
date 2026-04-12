import { useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { ReviewModal } from "./ReviewModal";
import { SeoHead } from "../seo/SeoHead";
import type { Review } from "../types";
import { getFrontendUrl } from "../api/http";

type RecentReviewsProps = {
  reviews: Review[];
};

const categories = ["Все", "Ресторан", "Услуги", "Магазин", "Отель", "Развлечения"];

export function RecentReviews({ reviews }: RecentReviewsProps) {
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const filteredReviews =
    selectedCategory === "Все"
      ? reviews
      : reviews.filter((review) => review.category === selectedCategory);

  return (
    <section className="max-w-3xl mx-auto">
      <SeoHead
        title="Последние отзывы | GENTLECOMMENT"
        description="Свежие отзывы пользователей по категориям: рестораны, услуги, магазины, отели и развлечения."
        canonical={`${getFrontendUrl()}/`}
      />

      <header>
        <h1 className="mb-6 text-3xl font-bold">Последние отзывы</h1>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Фильтр по категориям">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? "bg-[#7fb87f] text-white"
                : "bg-white border border-[#c5d9c5] hover:bg-[#f0f5f0]"
            }`}
          >
            {category}
          </button>
        ))}
      </nav>

      <div className="space-y-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              {...review}
              onClick={() => setSelectedReview(review)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500">Нет отзывов в этой категории</p>
        )}
      </div>

      <ReviewModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </section>
  );
}