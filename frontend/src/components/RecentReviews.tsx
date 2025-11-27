import { useState } from 'react';
import { ReviewCard } from './ReviewCard';
import { ReviewModal } from './ReviewModal';
import type { Review } from '../types';

type RecentReviewsProps = {
  reviews: Review[];
};

const categories = ['Все', 'Ресторан', 'Услуги', 'Магазин', 'Отель', 'Развлечения'];

export function RecentReviews({ reviews }: RecentReviewsProps) {
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const filteredReviews = selectedCategory === 'Все' 
    ? reviews 
    : reviews.filter(review => review.category === selectedCategory);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="mb-6">Последние отзывы</h2>
      
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-[#7fb87f] text-white'
                : 'bg-white border border-[#c5d9c5] hover:bg-[#f0f5f0]'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

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
    </div>
  );
}
