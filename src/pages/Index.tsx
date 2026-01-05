
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BlurContainer from '@/components/ui/BlurContainer';
import { ArrowRight, Sparkles, Ruler, Camera, Check } from 'lucide-react';

const Index = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const elements = document.querySelectorAll('.animate-on-scroll');
      
      elements.forEach((element) => {
        const el = element as HTMLElement;
        const elementPosition = el.offsetTop;
        const elementHeight = el.offsetHeight;
        
        // Check if element is in viewport
        if (scrollPosition > elementPosition - window.innerHeight + elementHeight / 3) {
          el.classList.add('animate-slide-up', 'opacity-100');
          el.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on initial load
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight text-gray-900 animate-fade-in">
            Discover Your <span className="text-garcia-600">Perfect Style</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up">
            Garcia provides personalized clothing recommendations based on your unique body shape, color, and style preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button asChild className="bg-garcia-600 hover:bg-garcia-700 px-8 py-6 text-md">
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={scrollToFeatures} 
              className="px-8 py-6 text-md"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50 px-6" ref={featuresRef}>
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 opacity-0 translate-y-10 animate-on-scroll">
              How Garcia Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto opacity-0 translate-y-10 animate-on-scroll">
              Our style recommendation engine uses advanced AI to analyze your unique features and preferences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <BlurContainer className="p-6 opacity-0 translate-y-10 animate-on-scroll">
              <div className="h-12 w-12 bg-garcia-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-garcia-600" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Style Quiz</h3>
              <p className="text-gray-600 mb-4">
                Take our quick style quiz to help us understand your preferences and fashion goals.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Color preferences</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Style aesthetic</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Clothing type priorities</span>
                </li>
              </ul>
            </BlurContainer>
            
            {/* Feature 2 */}
            <BlurContainer className="p-6 opacity-0 translate-y-10 animate-on-scroll" style={{ transitionDelay: '0.2s' }}>
              <div className="h-12 w-12 bg-garcia-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-garcia-600" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Image Analysis</h3>
              <p className="text-gray-600 mb-4">
                Upload a photo for our AI to analyze your body shape and recommend suitable styles.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Body type identification</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Color analysis</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Proportion-based suggestions</span>
                </li>
              </ul>
            </BlurContainer>
            
            {/* Feature 3 */}
            <BlurContainer className="p-6 opacity-0 translate-y-10 animate-on-scroll" style={{ transitionDelay: '0.4s' }}>
              <div className="h-12 w-12 bg-garcia-100 rounded-lg flex items-center justify-center mb-4">
                <Ruler className="h-6 w-6 text-garcia-600" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">Measurements</h3>
              <p className="text-gray-600 mb-4">
                Alternatively, input your measurements for precise style recommendations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Personalized fit suggestions</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Flattering silhouettes</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-garcia-600 mr-2" />
                  <span className="text-sm">Proportion optimization</span>
                </li>
              </ul>
            </BlurContainer>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-garcia-50 rounded-xl p-8 md:p-12 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gray-900 opacity-0 translate-y-10 animate-on-scroll">
                Ready to Transform Your Wardrobe?
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto opacity-0 translate-y-10 animate-on-scroll">
                Join thousands who have discovered their ideal style with Garcia's personalized recommendations.
              </p>
              <Button asChild className="bg-garcia-600 hover:bg-garcia-700 px-8 py-6 text-md opacity-0 translate-y-10 animate-on-scroll">
                <Link to="/signup">
                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-garcia-200 rounded-full -mt-20 -mr-20 opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-garcia-300 rounded-full -mb-10 -ml-10 opacity-20"></div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
