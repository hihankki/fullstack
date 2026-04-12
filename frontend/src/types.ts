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