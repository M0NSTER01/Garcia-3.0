import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStyleRecommendations, analyzeImage, validateGeminiApiConnection, StyleRecommendation as GeminiStyleRecommendation } from '@/services/geminiService';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Style quiz types
export type QuizAnswer = {
  questionId: string;
  answer: string | string[];
};

export type BodyMeasurements = {
  height: number; // in cm
  weight: number; // in kg
  bust?: number; // in cm
  waist: number; // in cm
  hips?: number; // in cm
  shoulders?: number; // in cm
  inseam?: number; // in cm
  gender: string; // Added gender field which is required by the Gemini service
};

export type StyleRecommendation = {
  bodyType: string;
  colorPalette: { name: string; hex: string }[];
  tops: string[];
  bottoms: string[];
  dresses?: string[];
  accessories: string[];
  outfits: string[];
};

type StyleContextType = {
  quizAnswers: QuizAnswer[];
  saveQuizAnswer: (questionId: string, answer: string | string[]) => void;
  measurements: BodyMeasurements | null;
  saveMeasurements: (measurements: BodyMeasurements) => void;
  recommendation: StyleRecommendation | null;
  isLoading: boolean;
  getRecommendationByMeasurements: () => Promise<void>;
  getRecommendationByImage: (imageUrl: string, occasion?: string) => Promise<void>;
  clearRecommendation: () => void;
  hasCompletedQuiz: boolean;
  setHasCompletedQuiz: (value: boolean) => void;
  updateRecommendation: (recommendation: StyleRecommendation) => void;
};

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
};

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [recommendation, setRecommendation] = useState<StyleRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null);

  // Validate API connection on load
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        console.log('StyleContext: Checking Gemini API connection...');

        // Try the primary validation method
        let isConnected = await validateGeminiApiConnection();

        // If that fails, try the direct method with raw fetch (most reliable)
        if (!isConnected) {
          console.log('StyleContext: Primary API check failed, trying direct fetch...');
          const { testApiWithRawFetch } = await import('@/services/geminiService');
          isConnected = await testApiWithRawFetch();
        }

        setIsApiConnected(isConnected);
        console.log('StyleContext: Gemini API connection result:', isConnected ? 'Connected ✅' : 'Failed to connect ❌');

        if (!isConnected) {
          console.error('StyleContext: API connection failed - recommendations will use fallback data');
          toast.error(
            'Could not connect to Gemini AI. Please check your API key and visit the Test page for troubleshooting.',
            {
              duration: 7000,
              action: {
                label: 'Test API',
                onClick: () => window.location.href = '/test-gemini'
              }
            }
          );
        } else {
          console.log('StyleContext: API connection successful - recommendations will use Gemini AI');
          toast.success('Connected to Gemini AI successfully');
        }
      } catch (error) {
        console.error('StyleContext: Failed to validate API connection:', error);
        setIsApiConnected(false);
        toast.error('Failed to connect to Gemini AI. Style recommendations may be limited.');
      }
    };

    checkApiConnection();
  }, []);

  const saveQuizAnswer = (questionId: string, answer: string | string[]) => {
    setQuizAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, answer };
        return updated;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const saveMeasurements = (data: BodyMeasurements) => {
    setMeasurements(data);
  };

  // Mock API response for demonstration
  const mockRecommendationAPI = async (): Promise<StyleRecommendation> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Return mock data
    return {
      bodyType: "Hourglass",
      colorPalette: [
        { name: "Azure Blue", hex: "#3a86ff" },
        { name: "Purple", hex: "#8338ec" },
        { name: "Rose", hex: "#ff006e" },
        { name: "Orange", hex: "#fb5607" },
        { name: "Amber", hex: "#ffbe0b" }
      ],
      tops: [
        "Fitted blouses with defined waistlines",
        "Wrap tops that accentuate your waist",
        "V-neck and scoop neck tops to highlight your balanced proportions"
      ],
      bottoms: [
        "High-waisted jeans or pants that showcase your waistline",
        "Pencil skirts that follow your curves",
        "A-line skirts that flare gently from the waist"
      ],
      dresses: [
        "Wrap dresses that highlight your defined waist",
        "Fit-and-flare dresses that accentuate your balanced proportions",
        "Bodycon dresses that showcase your curves"
      ],
      accessories: [
        "Statement belts to highlight your waist",
        "Delicate necklaces to draw attention to your neckline",
        "Medium-sized handbags that complement your proportions"
      ],
      outfits: [
        "Fitted blouse with high-waisted jeans and a statement belt",
        "Wrap dress with delicate accessories for an elegant look",
        "V-neck top with a pencil skirt for a professional appearance"
      ]
    };
  };

  // Format Gemini response to our app's format
  const formatGeminiResponse = (geminiResponse: GeminiStyleRecommendation): StyleRecommendation => {
    console.log('StyleContext: Formatting Gemini response to app format:', geminiResponse);

    // Extract the recommendations with safety checks
    const { tops = [], bottoms = [], accessories = [], dresses } = geminiResponse.recommendations || {};

    // Create formatted recommendations with default values if properties are missing
    return {
      bodyType: geminiResponse.bodyType || 'Unknown',
      colorPalette: geminiResponse.colorRecommendations || [],
      tops: tops || [],
      bottoms: bottoms || [],
      dresses: dresses || [],
      accessories: accessories || [],
      outfits: (tops || []).slice(0, 3).map((top, index) => {
        const bottom = bottoms && bottoms.length > 0 ? bottoms[index % bottoms.length] : 'any bottom';
        return `${top} with ${bottom}`;
      })
    };
  };

  // Convert quiz answers to preferences format needed for Gemini
  const getPreferencesFromQuiz = () => {
    console.log('StyleContext: Generating preferences from quiz answers:', quizAnswers);

    // Default preferences
    const preferences = {
      'style-preference': 'casual',
      'color-preference': ['blue', 'black', 'white'],
      'clothing-items': ['tops', 'bottoms'],
      'occasion': ['everyday'],
      'comfort-priority': 'medium'
    };

    // Update with actual quiz answers if available
    quizAnswers.forEach(answer => {
      if (answer.questionId === 'style' && typeof answer.answer === 'string') {
        preferences['style-preference'] = answer.answer;
      } else if (answer.questionId === 'colors' && Array.isArray(answer.answer)) {
        preferences['color-preference'] = answer.answer;
      } else if (answer.questionId === 'items' && Array.isArray(answer.answer)) {
        preferences['clothing-items'] = answer.answer;
      } else if (answer.questionId === 'occasion' && Array.isArray(answer.answer)) {
        preferences['occasion'] = answer.answer;
      } else if (answer.questionId === 'comfort' && typeof answer.answer === 'string') {
        preferences['comfort-priority'] = answer.answer;
      }
    });

    return preferences;
  };

  // Helper to determine gender from quiz answers
  const determineGenderFromQuiz = (): string => {
    // First check if we have measurements with gender
    if (measurements?.gender) {
      return measurements.gender;
    }

    // Try to find gender in quiz answers
    const genderAnswer = quizAnswers.find(a => a.questionId === 'gender');
    if (genderAnswer && typeof genderAnswer.answer === 'string') {
      return genderAnswer.answer;
    }

    // Check if dresses are selected in clothing preferences
    const clothingItems = quizAnswers.find(a => a.questionId === 'clothing-items');
    if (clothingItems && Array.isArray(clothingItems.answer) &&
      clothingItems.answer.includes('dresses')) {
      return 'female';
    }

    // Default to male if we can't determine
    return 'male';
  };

  const getRecommendationByMeasurements = async () => {
    if (!measurements) {
      console.error('StyleContext: No measurements available');
      return;
    }

    setIsLoading(true);
    console.log('StyleContext: Starting measurement-based recommendation process');

    try {
      // Check API connection status
      if (isApiConnected === false) {
        console.warn('StyleContext: Gemini API connection unavailable, using fallback data');
        throw new Error('API connection unavailable');
      }

      // Save quiz results to database if we have a user
      if (user && user.id) {
        try {
          console.log('StyleContext: Saving quiz results to database...');
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/quiz/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              answers: quizAnswers
            })
          });

          // Sync frontend state
          updateUser({ hasCompletedQuiz: true });
          setHasCompletedQuiz(true);
        } catch (dbError) {
          console.error('StyleContext: Failed to save quiz results:', dbError);
          // Don't fail the recommendation process if saving fails
        }
      }

      // Get user preferences from quiz answers
      const preferences = getPreferencesFromQuiz();
      console.log('StyleContext: Using measurements:', measurements);

      // Call the actual Gemini API
      const geminiResult = await getStyleRecommendations(measurements, preferences);
      console.log('StyleContext: Received Gemini API result:', geminiResult);

      // Format the response to match our app's format
      const formattedResult = formatGeminiResponse(geminiResult);
      console.log('StyleContext: Formatted result:', formattedResult);
      setRecommendation(formattedResult);
    } catch (error) {
      console.error('StyleContext: Failed to get recommendation:', error);
      // Show error to user
      toast.error('Failed to get style recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationByImage = async (imageUrl: string, occasion?: string) => {
    setIsLoading(true);
    console.log('StyleContext: Starting image-based recommendation process for occasion:', occasion);

    try {
      // Check API connection status
      if (isApiConnected === false) {
        console.warn('StyleContext: Gemini API connection unavailable, using fallback data');
        throw new Error('API connection unavailable');
      }

      // Validate the image data
      if (!imageUrl || !imageUrl.startsWith('data:image')) {
        console.error('StyleContext: Invalid image data format');
        toast.error('The uploaded file doesn\'t appear to be a valid image.');
        throw new Error('Invalid image format');
      }

      // Determine gender from quiz answers
      const gender = determineGenderFromQuiz();
      console.log('StyleContext: Using gender for image analysis:', gender);

      // Always show a processing toast
      const toastId = toast.loading('Analyzing your image...');

      // Call the actual Gemini API with the image
      try {
        const geminiResult = await analyzeImage(imageUrl, gender, occasion);
        console.log('StyleContext: Received Gemini API result from image analysis:', geminiResult);

        // Format the response to match our app's format
        const formattedResult = formatGeminiResponse(geminiResult);
        console.log('StyleContext: Formatted image analysis result:', formattedResult);

        // Update loading toast
        toast.dismiss(toastId);
        toast.success('Image analysis complete!');

        // Set the recommendation
        setRecommendation(formattedResult);
      } catch (apiError) {
        console.error('StyleContext: API error during image analysis:', apiError);

        // Dismiss loading toast and show error
        toast.dismiss(toastId);
        toast.error('Your image could not be fully analyzed. Using basic recommendations instead.');

        // Use fallback data but don't throw - provide best-effort recommendations
        const result = await mockRecommendationAPI();
        setRecommendation(result);
      }
    } catch (error) {
      console.error('StyleContext: Failed to get recommendation from image:', error);

      // Use fallback data for data preparation errors
      const result = await mockRecommendationAPI();
      setRecommendation(result);

      // Show a more specific error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('API connection')) {
          toast.error('Could not connect to AI service. Using basic recommendations instead.');
        } else if (error.message.includes('Invalid image format')) {
          toast.error('Please upload a valid image file (JPEG or PNG).');
        } else if (error.message.includes('Invalid image data')) {
          toast.error('Image could not be processed. Please try a different image.');
        } else {
          toast.error('An error occurred. Using basic recommendations instead.');
        }
      } else {
        toast.error('Failed to analyze image. Please try again with a different photo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearRecommendation = () => {
    setRecommendation(null);
  };

  return (
    <StyleContext.Provider
      value={{
        quizAnswers,
        saveQuizAnswer,
        measurements,
        saveMeasurements,
        recommendation,
        isLoading,
        getRecommendationByMeasurements,
        getRecommendationByImage,
        clearRecommendation,
        hasCompletedQuiz,
        setHasCompletedQuiz,
        updateRecommendation: setRecommendation // Expose setter for updates
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};
