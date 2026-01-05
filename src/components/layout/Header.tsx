
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-8',
        scrolled 
          ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-display font-bold text-garcia-950 dark:text-white tracking-tight hover:opacity-80 transition-opacity"
        >
          Garcia
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-garcia-600 dark:hover:text-garcia-400 transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Hi, {user?.username}
                </div>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-garcia-600 dark:hover:text-garcia-400 transition-colors"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-garcia-600 dark:hover:text-garcia-400 transition-colors"
              >
                Login
              </Link>
              <Button asChild variant="default" className="bg-garcia-600 hover:bg-garcia-700 dark:bg-garcia-500 dark:hover:bg-garcia-600">
                <Link to="/signup">
                  Sign Up
                </Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button 
            className="text-gray-700 dark:text-gray-200 hover:text-garcia-600 dark:hover:text-garcia-400 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={cn(
          "fixed inset-0 bg-white dark:bg-gray-900 z-40 transform transition-transform duration-300 ease-in-out md:hidden pt-20",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="container mx-auto px-6 py-8 flex flex-col space-y-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-garcia-100 dark:bg-garcia-800 flex items-center justify-center">
                  <User size={32} className="text-garcia-600 dark:text-garcia-400" />
                </div>
              </div>
              <div className="text-center mb-6">
                <p className="text-xl font-medium dark:text-white">Hi, {user?.username}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <Link 
                to="/dashboard" 
                className="text-center py-3 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-garcia-600 dark:hover:text-garcia-400 transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-center py-3 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-garcia-600 dark:hover:text-garcia-400 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-center py-3 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-garcia-600 dark:hover:text-garcia-400 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="text-center py-3 text-lg font-medium bg-garcia-600 dark:bg-garcia-500 text-white rounded-lg hover:bg-garcia-700 dark:hover:bg-garcia-600 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
