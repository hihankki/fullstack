import { Star } from "./Icons";
import type { Review } from "../types";
import { getApiUrl } from "../api/http";

type ReviewModalProps = {
  review: Review | null;
  onClose: () => void;
};

const API_URL = getApiUrl();

export function ReviewModal({ review, onClose }: ReviewModalProps) {
  if (!review) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-[#c5d9c5] p-6 flex justify-between items-start">
          <div className="flex-1">
            <span className="px-3 py-1 bg-[#e8efe8] rounded-full text-sm">
              {review.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < review.rating
                    ? "fill-[#7fb87f] text-[#7fb87f]"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            ))}
            <span className="text-gray-500 ml-2">{review.date}</span>
          </div>

          <h2 className="mb-4">{review.title}</h2>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">
            {review.text}
          </p>

          {review.files && review.files.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Прикреплённые файлы</h3>
              <div className="space-y-2">
                {review.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between border rounded-lg px-3 py-2"
                  >
                    <div>
                      <div className="font-medium break-all">{file.filename}</div>
                      <div className="text-sm text-gray-500">
                        {file.content_type} · {(file.size / 1024).toFixed(1)} KB
                      </div>
                    </div>

                    <a
                      href={`${API_URL}/uploads/${file.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg bg-[#7fb87f] text-white hover:bg-[#6ba66b]"
                    >
                      Открыть
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!review.files || review.files.length === 0) && (
            <div className="mb-6 text-gray-500">Файлы не прикреплены</div>
          )}

          <p className="text-gray-600">- {review.author}</p>
        </div>
      </div>
    </div>
  );
}