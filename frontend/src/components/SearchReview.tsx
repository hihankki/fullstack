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
  const [results, setResults] = useState(reviews);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = reviews.filter(
      (review) =>
        review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setResults(filtered);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-[#c5d9c5] mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <SimpleInput
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, отзывам, автору или категории..."
            className="flex-1"
          />
          <SimpleButton type="submit" className="flex items-center">
            <Search className="w-4 h-4 mr-2" />
            Искать
          </SimpleButton>
        </form>
      </div>
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
      
      <ReviewModal 
        review={selectedReview} 
        onClose={() => setSelectedReview(null)} 
      />
    </div>
  );
}
