import { useEffect, useState } from "react";
import type { ExternalWeather } from "../types";
import { apiFetch } from "../api/http";

type ExternalWeatherProps = {
  city: string;
};

function weatherCodeToText(code: number | null) {
  if (code === null || code === undefined) return "Неизвестно";
  const map: Record<number, string> = {
    0: "Ясно",
    1: "Преимущественно ясно",
    2: "Переменная облачность",
    3: "Пасмурно",
    45: "Туман",
    48: "Изморозь",
    51: "Слабая морось",
    53: "Морось",
    55: "Сильная морось",
    61: "Слабый дождь",
    63: "Дождь",
    65: "Сильный дождь",
    71: "Слабый снег",
    73: "Снег",
    75: "Сильный снег",
    80: "Ливень",
    95: "Гроза",
  };
  return map[code] || `Код погоды: ${code}`;
}

export function ExternalWeather({ city }: ExternalWeatherProps) {
  const [data, setData] = useState<ExternalWeather | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch(
          `/api/external/weather?city=${encodeURIComponent(city)}`,
          { method: "GET" },
          false
        );

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.detail || "Не удалось получить погоду");
        }

        const json = (await res.json()) as ExternalWeather;
        if (mounted) setData(json);
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "Ошибка");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [city]);

  if (loading) {
    return (
      <section className="bg-white rounded-xl border border-[#c5d9c5] p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Погода</h2>
        <p className="text-gray-500">Загрузка погоды...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white rounded-xl border border-[#c5d9c5] p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Погода</h2>
        <p className="text-gray-500">
          Погода временно недоступна, но страница работает нормально.
        </p>
      </section>
    );
  }

  if (!data || data.temperature === null) {
    return (
      <section className="bg-white rounded-xl border border-[#c5d9c5] p-6 mb-6">
        <h2 className="text-xl font-semibold mb-3">Погода</h2>
        <p className="text-gray-500">Для города {city} данные не найдены.</p>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-[#c5d9c5] p-6 mb-6">
      <h2 className="text-xl font-semibold mb-3">Погода</h2>
      <div className="space-y-2 text-gray-700">
        <p>
          <strong>Город:</strong> {data.resolved_name || city}
          {data.country ? `, ${data.country}` : ""}
        </p>
        <p>
          <strong>Температура:</strong> {data.temperature}°C
        </p>
        <p>
          <strong>Ветер:</strong> {data.wind_speed} км/ч
        </p>
        <p>
          <strong>Состояние:</strong> {weatherCodeToText(data.weather_code)}
        </p>
      </div>
    </section>
  );
}