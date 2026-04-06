import { useState } from "react";
import { Star } from "./Icons";
import { SimpleButton } from "./SimpleButton";
import { SimpleTextarea } from "./SimpleTextarea";
import { SimpleInput } from "./SimpleInput";

type CreateReviewProps = {
  onCreateReview: (
    rating: number,
    title: string,
    text: string,
    category: string,
    file?: File | null
  ) => void;
  loading?: boolean;
  error?: string | null;
};

const categories = ["Ресторан", "Услуги", "Магазин", "Отель", "Развлечения"];

export function CreateReview({
  onCreateReview,
  loading,
  error,
}: CreateReviewProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Пожалуйста, выберите оценку");
      return;
    }

    if (loading) return;

    // 🔥 если есть файл — сначала загружаем
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await fetch("http://127.0.0.1:8000/api/files/upload", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        alert("Ошибка загрузки файла");
        return;
      }
    }

    // затем создаём отзыв
    onCreateReview(rating, title, text, category, file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg p-8 shadow-sm border border-[#c5d9c5]">
        <h2 className="mb-6">Создать отзыв</h2>

        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* КАТЕГОРИЯ */}
          <div>
            <label className="block mb-3">Категория</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    category === cat
                      ? "bg-[#7fb87f] text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* ОЦЕНКА */}
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
                        ? "fill-[#7fb87f] text-[#7fb87f]"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* НАЗВАНИЕ */}
          <div>
            <label className="block mb-3">Название</label>
            <SimpleInput
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder='Например: Ресторан "Пушкин"'
              className="w-full"
            />
          </div>

          {/* ТЕКСТ */}
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

          {/* 🔥 ФАЙЛ */}
          <div>
            <label className="block mb-2">Прикрепить файл</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full"
            />
          </div>

          {/* КНОПКА */}
          <SimpleButton type="submit" className="w-full" disabled={loading}>
            {loading ? "Сохраняем..." : "Опубликовать отзыв"}
          </SimpleButton>
        </form>
      </div>
    </div>
  );
}