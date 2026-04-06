import { useState } from "react";
import { ReviewCard } from "./ReviewCard";
import { SimpleButton } from "./SimpleButton";
import { Plus } from "./Icons";
import { ReviewModal } from "./ReviewModal";
import type { Review, Page } from "../types";

type MyReviewsProps = {
  reviews: Review[];
  onNavigate: (page: Page) => void;
  onDeleteReview: (reviewId: number) => void;
  isAdmin: boolean;
};



const categories = [
  "Все",
  "Ресторан",
  "Услуги",
  "Магазин",
  "Отель",
  "Развлечения",
];

export function MyReviews({
  reviews,
  onNavigate,
  onDeleteReview,
  isAdmin,
}: MyReviewsProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Все");

  const filteredReviews =
    selectedCategory === "Все"
      ? reviews
      : reviews.filter((r) => r.category === selectedCategory);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Заголовок + кнопка "Новый отзыв" */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold mb-1">Мои отзывы</h1>
          <p className="text-sm text-gray-600">
            Здесь собраны ваши отзывы. Администратор видит все отзывы.
          </p>
        </div>

        <SimpleButton
          onClick={() => onNavigate("create")}
          className="flex items-center gap-2 px-5 py-2 text-sm md:text-base"
        >
          <Plus className="w-4 h-4" />
          Новый отзыв
        </SimpleButton>
      </div>

      {/* Категории */}
      <div className="flex flex-wrap gap-3 mb-6">
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`min-w-[100px] px-4 py-2 rounded-full text-sm md:text-base font-medium text-center transition-colors ${
                active
                  ? "bg-[#7fb87f] text-white"
                  : "bg-white text-gray-700 border border-[#c5d9c5] hover:bg-[#f3f7f3]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Список отзывов / пустое состояние */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-10 px-6 bg-white rounded-lg border border-dashed border-[#c5d9c5]">
          <p className="text-gray-600 mb-4">
            В этой категории пока нет отзывов.
          </p>
          <SimpleButton
            onClick={() => onNavigate("create")}
            className="mt-2 inline-flex items-center justify-center px-6 py-2 text-sm md:text-base"
          >
            Создать первый отзыв
          </SimpleButton>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              author={review.author}
              rating={review.rating}
              date={review.date} // уже отформатировано в App.tsx
              title={review.title}
              text={review.text}
              category={review.category}
              isUserReview={review.isUserReview || isAdmin}
              onDelete={() => onDeleteReview(review.id)}
              onClick={() => setSelectedReview(review)}
            />
          ))}
        </div>
      )}

      <ReviewModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </div>
  );
}
