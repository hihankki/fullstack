import { Star } from './Icons';

type ReviewCardProps = {
  author: string;
  rating: number;
  date: string;
  text: string;
};

export function ReviewCard({ author, rating, date, text }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-[#c5d9c5]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < rating
                    ? 'fill-[#7fb87f] text-[#7fb87f]'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <span className="text-gray-500 text-sm">{date}</span>
      </div>
      <p className="text-gray-700 mb-2">{text}</p>
      <p className="text-gray-600">- {author}</p>
    </div>
  );
}
