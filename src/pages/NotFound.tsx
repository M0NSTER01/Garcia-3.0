
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-9xl font-display font-bold text-garcia-600 mb-4 animate-float">404</h1>
          <p className="text-2xl text-gray-800 mb-6 animate-fade-in">Oops! Page not found</p>
          <p className="text-gray-600 mb-8 animate-fade-in">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Button asChild className="bg-garcia-600 hover:bg-garcia-700 animate-fade-in">
            <Link to="/" className="flex items-center">
              <Home className="mr-2 h-4 w-4" /> Return to Home
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
