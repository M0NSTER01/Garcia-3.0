
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-background pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block">
              <h2 className="text-3xl font-display font-bold text-foreground">Garcia</h2>
            </Link>
            <p className="mt-4 text-muted-foreground max-w-md">
              Personalized style recommendations based on your body shape, color, and style preferences.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Services</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/dashboard" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Style Recommendations
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Body Type Analysis
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Color Matching
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-base text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Garcia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
