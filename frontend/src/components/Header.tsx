import type { Page } from "../types";

type HeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  onNavigate: (page: Page | "admin") => void;
  onLogout: () => void;
};

export function Header({ isLoggedIn, isAdmin, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="w-full border-b border-[#c5d9c5] bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNavigate("recent")}
          className="italic tracking-wide text-lg"
        >
          GENTLECOMMENT
        </button>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("recent")}
            className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
          >
            Последние отзывы
          </button>

          <button
            onClick={() => onNavigate("search")}
            className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
          >
            Поиск
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

              {isAdmin && (
                <button
                  onClick={() => onNavigate("admin")}
                  className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
                >
                  Админка
                </button>
              )}

              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm rounded-lg hover:bg-[#b9d0b9] transition-colors"
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
        </nav>
      </div>
    </header>
  );
}