import { useState } from 'react';
import { SimpleInput } from './SimpleInput';
import { SimpleButton } from './SimpleButton';
import { Search } from './Icons';
import { ReviewCard } from './ReviewCard';
import { ReviewModal } from './ReviewModal';
import type { Review } from '../types';

type SearchReviewProps = {
  reviews: Review[];
};

export function SearchReview({ reviews }: SearchReviewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState('');
  const [results, setResults] = useState(reviews);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);


  const fetchReviews = async (customPage?: number) => {
    const query = new URLSearchParams({
      search: searchQuery,
      author: author,
      min_rating: rating,
      page: String(customPage || page),
    }).toString();

    const res = await fetch(`http://127.0.0.1:8000/api/reviews?${query}`);
    const data = await res.json();

    setResults(data);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchReviews(1);
  };

  const handleNext = async () => {
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
      {/* ФОРМА */}
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
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Мин. рейтинг (1-5)"
          />

          <SimpleButton type="submit" className="flex items-center justify-center">
            <Search className="w-4 h-4 mr-2" />
            Искать
          </SimpleButton>
        </form>
      </div>

      {/* СПИСОК */}
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
          <p className="text-center text-gray-500">Отзывы не найдены</p>
        )}
      </div>

      {/* ПАГИНАЦИЯ */}
      <div className="flex justify-between mt-6">
        <SimpleButton onClick={handlePrev} disabled={page === 1}>
          Назад
        </SimpleButton>

        <span>Страница {page}</span>

        <SimpleButton onClick={handleNext}>
          Вперед
        </SimpleButton>
      </div>

      {/* МОДАЛКА */}
      <ReviewModal
        review={selectedReview}
        onClose={() => setSelectedReview(null)}
      />
    </div>
  );
}