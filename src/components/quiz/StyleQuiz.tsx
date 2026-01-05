
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useStyle } from '@/contexts/StyleContext';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Quiz data
const quizQuestions = [
  {
    id: 'style-preference',
    title: "What's your style preference?",
    description: 'Choose the style that resonates most with you',
    type: 'radio',
    options: [
      { value: 'casual', label: 'Casual & Relaxed' },
      { value: 'formal', label: 'Formal & Professional' },
      { value: 'streetwear', label: 'Streetwear & Urban' },
      { value: 'classic', label: 'Classic & Timeless' },
      { value: 'bohemian', label: 'Bohemian & Free-spirited' }
    ]
  },
  {
    id: 'color-preference',
    title: 'Which color palette do you prefer?',
    description: 'Select your favorite colors',
    type: 'checkboxes',
    options: [
      { value: 'neutrals', label: 'Neutrals (Black, White, Beige, Gray)' },
      { value: 'earth-tones', label: 'Earth Tones (Brown, Olive, Terracotta)' },
      { value: 'pastels', label: 'Pastels (Soft Pink, Baby Blue, Mint)' },
      { value: 'bold', label: 'Bold Colors (Red, Royal Blue, Yellow)' },
      { value: 'monochrome', label: 'Monochromatic (Varying shades of one color)' }
    ]
  },
  {
    id: 'clothing-items',
    title: 'What clothing items do you wear most often?',
    description: 'Select all that apply',
    type: 'checkboxes',
    options: [
      { value: 'tshirts', label: 'T-shirts & Casual Tops' },
      { value: 'blouses', label: 'Blouses & Button-ups' },
      { value: 'dresses', label: 'Dresses & Skirts' },
      { value: 'jeans', label: 'Jeans & Pants' },
      { value: 'athleisure', label: 'Athleisure & Sportswear' }
    ]
  },
  {
    id: 'occasion',
    title: 'For what occasions do you need style recommendations?',
    description: 'Where do you plan to wear these outfits?',
    type: 'checkboxes',
    options: [
      { value: 'everyday', label: 'Everyday Casual' },
      { value: 'work', label: 'Work & Office' },
      { value: 'formal-events', label: 'Formal Events & Parties' },
      { value: 'dates', label: 'Dates & Night Out' },
      { value: 'outdoor', label: 'Outdoor Activities' }
    ]
  },
  {
    id: 'comfort-priority',
    title: "What's most important to you in clothing?",
    description: 'Select your top priority',
    type: 'radio',
    options: [
      { value: 'comfort', label: 'Comfort & Ease of Movement' },
      { value: 'appearance', label: 'Appearance & Style' },
      { value: 'functionality', label: 'Functionality & Practicality' },
      { value: 'trend', label: 'Trendiness & Fashion-forward' },
      { value: 'sustainability', label: 'Sustainability & Ethical Production' }
    ]
  }
];

const StyleQuiz = () => {
  const navigate = useNavigate();
  const { saveQuizAnswer, setHasCompletedQuiz } = useStyle();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  const handleRadioChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value
    });
  };

  const handleCheckboxChange = (checked: boolean, value: string) => {
    const currentAnswers = answers[currentQuestion.id] as string[] || [];
    
    if (checked) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...currentAnswers, value]
      });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentAnswers.filter(item => item !== value)
      });
    }
  };

  const handleNext = () => {
    // Validate current answer
    if (!answers[currentQuestion.id] || 
       (Array.isArray(answers[currentQuestion.id]) && 
        (answers[currentQuestion.id] as string[]).length === 0)) {
      toast.error('Please select at least one option');
      return;
    }

    // Save the answer
    saveQuizAnswer(
      currentQuestion.id, 
      answers[currentQuestion.id] as string | string[]
    );

    // Move to next question or finish
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the quiz
      setHasCompletedQuiz(true);
      navigate('/dashboard');
      toast.success('Style preferences saved successfully!');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkipQuiz = () => {
    // Save empty answers or defaults
    quizQuestions.forEach(question => {
      if (!answers[question.id]) {
        saveQuizAnswer(
          question.id, 
          question.type === 'radio' ? question.options[0].value : [question.options[0].value]
        );
      }
    });
    
    setHasCompletedQuiz(true);
    navigate('/dashboard');
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="animate-fade-in shadow-lg border-garcia-200">
        <CardHeader className="space-y-1 pb-3">
          <div className="flex justify-between items-center mb-1">
            <CardTitle className="text-2xl font-display">Style Preferences</CardTitle>
            <span className="text-sm font-medium text-garcia-600">
              {currentQuestionIndex + 1} of {quizQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="pt-2">
            Help us understand your style to provide better recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-medium">{currentQuestion.title}</h3>
              <p className="text-sm text-muted-foreground">{currentQuestion.description}</p>
            </div>

            {currentQuestion.type === 'radio' ? (
              <RadioGroup
                value={answers[currentQuestion.id] as string || ''}
                onValueChange={handleRadioChange}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem id={option.value} value={option.value} />
                    <Label htmlFor={option.value} className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <Checkbox
                      id={option.value}
                      checked={
                        Array.isArray(answers[currentQuestion.id])
                          ? (answers[currentQuestion.id] as string[]).includes(option.value)
                          : false
                      }
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(checked as boolean, option.value)
                      }
                    />
                    <Label htmlFor={option.value} className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-6">
          <div>
            {currentQuestionIndex > 0 ? (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkipQuiz}
                className="text-muted-foreground"
              >
                Skip Quiz
              </Button>
            )}
          </div>
          <Button
            onClick={handleNext}
            className="flex items-center bg-garcia-600 hover:bg-garcia-700"
          >
            {currentQuestionIndex === quizQuestions.length - 1 ? (
              <>
                Complete <CheckCircle className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Next <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StyleQuiz;
