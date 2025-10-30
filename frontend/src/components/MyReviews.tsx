import { ReviewCard } from './ReviewCard';
import { SimpleButton } from './SimpleButton';
import { Plus } from './Icons';

type MyReviewsProps = {
  onNavigate: (page: 'create') => void;
};

const mockUserReviews = [
  {
    id: 1,
    author: 'Вы',
    rating: 5,
    date: 'давно 1 неделя',
    text: 'Мой первый отзыв на этой платформе. Все очень удобно!',
  },
];

export function MyReviews({ onNavigate }: MyReviewsProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2>Мои отзывы</h2>
        <SimpleButton
          onClick={() => onNavigate('create')}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Создать отзыв
        </SimpleButton>
      </div>
      <div className="space-y-6">
        {mockUserReviews.map((review) => (
          <ReviewCard key={review.id} {...review} />
        ))}
      </div>
    </div>
  );
}
