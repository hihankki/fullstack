import { useState } from 'react';
import { SimpleInput } from './SimpleInput';
import { SimpleButton } from './SimpleButton';
import { Search } from './Icons';
import { ReviewCard } from './ReviewCard';

const allReviews = [
  {
    id: 1,
    author: 'Ева БрА',
    rating: 5,
    date: 'давно 3 недели',
    text: 'Очень понравилось обслуживание! Все вежливые и внимательные. Рекомендую!',
  },
  {
    id: 2,
    author: 'Иван Петров',
    rating: 4,
    date: 'давно 1 день',
    text: 'Хорошее место, качественный сервис. Единственный минус - долгое ожидание.',
  },
  {
    id: 3,
    author: 'Мария С.',
    rating: 5,
    date: 'давно 2 дня',
    text: 'Отличный опыт! Все на высшем уровне. Обязательно вернусь снова.',
  },
];

export function SearchReview() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(allReviews);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = allReviews.filter(
      (review) =>
        review.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.author.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Поиск отзывов..."
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
          results.map((review) => <ReviewCard key={review.id} {...review} />)
        ) : (
          <p className="text-center text-gray-500">Отзывы не найдены</p>
        )}
      </div>
    </div>
  );
}
