import { Link } from "react-router-dom";
import { Star, Trash } from "./Icons";

type ReviewCardProps = {
  id: number;
  author: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  category: string;
  isUserReview?: boolean;
  onDelete?: () => void;
  onClick?: () => void;
};

function truncateText(text: string, maxLength: number) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

export function ReviewCard({
  id,
  author,
  rating,
  date,
  title,
  text,
  category,
  isUserReview,
  onDelete,
  onClick,
}: ReviewCardProps) {
  return (
    <article
      className="bg-white rounded-xl shadow-sm border border-[#c5d9c5] p-6 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="flex flex-col gap-2">
          <span className="inline-block px-4 py-1 rounded-full bg-[#edf5ed] text-sm text-gray-700">
            {category}
          </span>
          <div className="flex items-center gap-1" aria-label={`Оценка ${rating} из 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`w-5 h-5 ${
                  index < rating
                    ? "fill-[#7fb87f] text-[#7fb87f]"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-sm text-gray-500">{date}</span>
          {isUserReview && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-500 hover:text-red-600"
              title="Удалить отзыв"
            >
              <Trash className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <header className="mb-2">
        <h2 className="font-semibold text-lg">
          <Link
            to={`/reviews/${id}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="hover:underline"
          >
            {title}
          </Link>
        </h2>
      </header>

      <p className="text-gray-700 mb-2 whitespace-pre-wrap break-words break-all">
        {truncateText(text, 200)}
      </p>

      <footer className="text-gray-600">— {author}</footer>
    </article>
  );
}