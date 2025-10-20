import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import Header from './Header';
import Navigation from './Navigation';
import CategoryBar from './CategoryBar';
import LoginModal from './LoginModal';

export default function Layout() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white relative">
      <AnimatedBackground />
      <Header onCartClick={handleCartClick} onLoginClick={handleLoginClick} />
      <Navigation onLoginClick={handleLoginClick} />
      <CategoryBar />
      <main className="pt-[176px]">
        <Outlet />
      </main>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
