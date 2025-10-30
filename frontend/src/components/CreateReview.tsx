import { useState } from 'react';
import { Star } from './Icons';
import { SimpleButton } from './SimpleButton';
import { SimpleTextarea } from './SimpleTextarea';

type CreateReviewProps = {
  onNavigate: (page: 'my-reviews') => void;
};

export function CreateReview({ onNavigate }: CreateReviewProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('my-reviews');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border border-[#c5d9c5]">
        <h2 className="mb-6">Создать отзыв</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-3">Оценка</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-[#7fb87f] text-[#7fb87f]'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-3">Текст отзыва</label>
            <SimpleTextarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              className="w-full min-h-[150px]"
              placeholder="Напишите ваш отзыв..."
            />
          </div>
          <SimpleButton type="submit" className="w-full">
            Опубликовать отзыв
          </SimpleButton>
        </form>
      </div>
    </div>
  );
}
