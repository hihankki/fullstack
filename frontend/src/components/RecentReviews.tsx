import { ReviewCard } from './ReviewCard';

const mockReviews = [
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

export function RecentReviews() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-6">
        {mockReviews.map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </div>
    </div>
  );
}
