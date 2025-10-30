import { useState } from 'react';
import { Header } from './components/Header';
import { RecentReviews } from './components/RecentReviews';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { MyReviews } from './components/MyReviews';
import { CreateReview } from './components/CreateReview';
import { SearchReview } from './components/SearchReview';

type Page = 'recent' | 'login' | 'register' | 'my-reviews' | 'create' | 'search';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('recent');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('my-reviews');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('recent');
  };

  return (
    <div className="min-h-screen bg-[#e8efe8]">
      <Header 
        isLoggedIn={isLoggedIn}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'recent' && <RecentReviews />}
        {currentPage === 'login' && <LoginForm onLogin={handleLogin} />}
        {currentPage === 'register' && <RegisterForm onRegister={handleLogin} />}
        {currentPage === 'my-reviews' && isLoggedIn && <MyReviews onNavigate={setCurrentPage} />}
        {currentPage === 'create' && isLoggedIn && <CreateReview onNavigate={setCurrentPage} />}
        {currentPage === 'search' && <SearchReview />}
      </main>
    </div>
  );
}
