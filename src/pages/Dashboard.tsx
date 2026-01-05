
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ImageUpload from '@/components/dashboard/ImageUpload';
import MeasurementForm from '@/components/dashboard/MeasurementForm';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import { useAuth } from '@/contexts/AuthContext';
import { useStyle } from '@/contexts/StyleContext';
import ChatAssistant from '@/components/dashboard/ChatAssistant';
import BlurContainer from '@/components/ui/BlurContainer';
import VirtualTryOn from '@/components/dashboard/VirtualTryOn';
import { Camera, Ruler, Shirt } from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { recommendation, clearRecommendation, hasCompletedQuiz, updateRecommendation } = useStyle();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Redirect to quiz if not completed
    if (!isLoading && isAuthenticated && user && !hasCompletedQuiz && !user.hasCompletedQuiz) {
      navigate('/quiz');
    }
  }, [isAuthenticated, isLoading, navigate, user, hasCompletedQuiz]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 mt-4 text-center">
            Style Recommendations
          </h1>
          <p className="text-center text-muted-foreground mb-10">
            Discover clothing styles tailored to your body shape and preferences
          </p>

          {recommendation ? (
            <div className="space-y-6 animate-fade-in">
              <RecommendationCard
                recommendation={recommendation}
                onClear={clearRecommendation}
              />
              <ChatAssistant
                recommendation={recommendation}
                onUpdateRecommendation={updateRecommendation}
              />
            </div>
          ) : (
            <>
              <p className="text-center mb-8">
                Choose one of the methods below to get your personalized style recommendations:
              </p>

              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="upload" className="flex items-center justify-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="try-on" className="flex items-center justify-center gap-2">
                    <Shirt className="h-4 w-4" />
                    <span className="hidden sm:inline">Try On</span>
                  </TabsTrigger>
                  <TabsTrigger value="measurements" className="flex items-center justify-center gap-2">
                    <Ruler className="h-4 w-4" />
                    <span className="hidden sm:inline">Measurements</span>
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-6">
                  <TabsContent value="upload" className="m-0 animate-fade-in">
                    <BlurContainer className="p-1">
                      <ImageUpload />
                    </BlurContainer>
                    <div className="mt-4 text-sm text-center text-muted-foreground">
                      Upload a full-body photo for accurate body type analysis and personalized recommendations
                    </div>
                  </TabsContent>

                  <TabsContent value="try-on" className="m-0 animate-fade-in">
                    <VirtualTryOn />
                  </TabsContent>

                  <TabsContent value="measurements" className="m-0 animate-fade-in">
                    <BlurContainer className="p-1">
                      <MeasurementForm />
                    </BlurContainer>
                    <div className="mt-4 text-sm text-center text-muted-foreground">
                      Enter your measurements for precise style recommendations based on your body proportions
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
