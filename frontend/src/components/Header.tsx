type HeaderProps = {
  isLoggedIn: boolean;
  onNavigate: (page: 'recent' | 'login' | 'register' | 'my-reviews' | 'create' | 'search') => void;
  onLogout: () => void;
};

export function Header({ isLoggedIn, onNavigate, onLogout }: HeaderProps) {
  return (
    <header className="bg-[#d4e5d4] border-b border-[#a8c5a8] py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <button 
          onClick={() => onNavigate('recent')}
          className="italic tracking-wide"
        >
          GENTLECOMMENT
        </button>
        
        <div className="flex gap-4">
          {!isLoggedIn ? (
            <>
              <button 
                onClick={() => onNavigate('login')}
                className="hover:underline"
              >
                Войти
              </button>
              <button 
                onClick={() => onNavigate('register')}
                className="hover:underline"
              >
                Зарегистрироваться
              </button>
            </>
          ) : (
            <button 
              onClick={onLogout}
              className="hover:underline"
            >
              Выйти
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
