export type Review = {
  id: number;
  author: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  category: string;
  isUserReview?: boolean;
};

export type Page = 'recent' | 'login' | 'register' | 'my-reviews' | 'create' | 'search';
