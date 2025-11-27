import type { Page } from "../types";

type HeaderProps = {
  isLoggedIn: boolean;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
};

export function Header({ isLoggedIn, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="bg-[#d4e5d4] border-b border-[#a8c5a8] py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button
          onClick={() => onNavigate("recent")}
          className="italic tracking-wide"
        >
          GENTLECOMMENT
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("recent")}
            className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
          >
            Последние отзывы
          </button>

          {isLoggedIn ? (
            <>
              <button
                onClick={() => onNavigate("my-reviews")}
                className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
              >
                Мои отзывы
              </button>
              <button
                onClick={() => onNavigate("create")}
                className="px-3 py-2 text-sm rounded-lg bg-[#7fb87f] text-white hover:bg-[#6ba66b] transition-colors"
              >
                Написать отзыв
              </button>
              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm rounded-lg hover:bg-red-100 text-red-600 transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("login")}
                className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
              >
                Вход
              </button>
              <button
                onClick={() => onNavigate("register")}
                className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
