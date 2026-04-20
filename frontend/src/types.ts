export type Page =
  | "recent"
  | "login"
  | "register"
  | "my-reviews"
  | "create"
  | "search";

export type ReviewFile = {
  id: number;
  filename: string;
  content_type: string;
  size: number;
  created_at: string;
};

export type Review = {
  id: number;
  author: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  category: string;
  city: string;
  isUserReview?: boolean;
  files?: ReviewFile[];
  file_url?: string | null;
};

export type ExternalWeather = {
  city: string;
  resolved_name: string | null;
  country: string | null;
  temperature: number | null;
  wind_speed: number | null;
  weather_code: number | null;
  source: string;
};