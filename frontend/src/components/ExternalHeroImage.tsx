import { useEffect, useState } from "react";
import type { ExternalImage } from "../types";
import { apiFetch } from "../api/http";

type ExternalHeroImageProps = {
  category: string;
  title: string;
};

export function ExternalHeroImage({ category, title }: ExternalHeroImageProps) {
  const [data, setData] = useState<ExternalImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setFailed(false);

      try {
        const res = await apiFetch(
          `/api/external/category-image?category=${encodeURIComponent(category)}`,
          { method: "GET" },
          false
        );

        if (!res.ok) {
          throw new Error("failed");
        }

        const json = (await res.json()) as ExternalImage;
        if (mounted) {
          setData(json);
        }
      } catch {
        if (mounted) {
          setFailed(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [category]);

  if (loading) {
    return (
      <div className="w-full h-[260px] rounded-xl bg-gray-100 animate-pulse mb-6" />
    );
  }

  if (failed || !data?.image_url) {
    return (
      <div className="w-full rounded-xl border border-[#c5d9c5] bg-white p-6 mb-6 text-gray-600">
        Изображение для категории не загружено, но страница работает нормально.
      </div>
    );
  }

  return (
    <figure className="mb-6">
      <img
        src={data.image_url}
        alt={data.alt || title}
        loading="lazy"
        className="w-full h-[260px] object-cover rounded-xl border border-[#c5d9c5]"
      />
      {(data.author_name || data.author_url) && (
        <figcaption className="mt-2 text-sm text-gray-500">
          Фото:{" "}
          {data.author_url ? (
            <a
              href={data.author_url}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              {data.author_name || "автор"}
            </a>
          ) : (
            data.author_name
          )}
        </figcaption>
      )}
    </figure>
  );
}