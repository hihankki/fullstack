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
  isUserReview?: boolean;
  files?: ReviewFile[];
};

export type ExternalImage = {
  category: string;
  image_url: string | null;
  thumb_url: string | null;
  alt: string;
  author_name: string | null;
  author_url: string | null;
  source: string;
};