import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UploadCloud, X, Image as ImageIcon, Loader2, Bug } from 'lucide-react';
import { useStyle } from '@/contexts/StyleContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ImageUpload = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [occasion, setOccasion] = useState<string>('');
  const [customOccasion, setCustomOccasion] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getRecommendationByImage, isLoading } = useStyle();
  const { user } = useAuth();
  const [showKeyAlert, setShowKeyAlert] = useState(false);

  useEffect(() => {
    // Check if API key is set to the default value
    const checkApiKeyConfig = async () => {
      try {
        // We can't access the API_KEY constant directly, so we'll test if it works
        const result = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY_HERE'
        );

        // If this exact error occurs, we know they're still using the placeholder key
        const data = await result.json();
        if (data?.error?.message?.includes('API key not valid')) {
          setShowKeyAlert(true);
        }
      } catch (error) {
        console.error('Error checking API key:', error);
      }
    };

    checkApiKeyConfig();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Check file type
    if (!file.type.match('image/(jpeg|jpg|png)')) {
      toast.error('Please select a JPEG or PNG image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log('Image loaded, size:', result ? result.length : 'unknown', 'type:', file.type);

      // Ensure it's a data URL
      if (result && result.startsWith('data:image/')) {
        setSelectedImage(result);
      } else {
        toast.error('The file could not be processed as an image');
        console.error('Invalid image data format:', result ? result.substring(0, 50) + '...' : 'No data');
      }
    };

    // Read as data URL which gives us the base64 format
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetRecommendation = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    console.log('Sending image to API, data length:', selectedImage.length);

    try {
      // Determine final occasion validation
      let finalOccasion = occasion;
      if (occasion === 'other') {
        if (!customOccasion.trim()) {
          toast.error('Please specify the occasion');
          return;
        }
        finalOccasion = customOccasion;
      }

      // Make sure we pass the image in correct format
      await getRecommendationByImage(selectedImage, finalOccasion);
    } catch (error) {
      console.error('Error getting recommendation:', error);
      toast.error('Failed to analyze image. Please try again.');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">


        {selectedImage ? (
          <div className="relative">
            <img
              src={selectedImage}
              alt="Uploaded"
              className="w-full h-auto max-h-[400px] object-contain rounded-md animate-fade-in"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearImage}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="occasion">Occasion (Optional)</Label>
                <Select value={occasion} onValueChange={setOccasion}>
                  <SelectTrigger id="occasion" className="bg-background dark:bg-muted/20">
                    <SelectValue placeholder="Select an occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Everyday / Casual</SelectItem>
                    <SelectItem value="formal">Formal Event</SelectItem>
                    <SelectItem value="college">College / Work</SelectItem>
                    <SelectItem value="party">Party / Night Out</SelectItem>
                    <SelectItem value="family">Family Function</SelectItem>
                    <SelectItem value="date">Date Night</SelectItem>
                    <SelectItem value="vacation">Vacation / Travel</SelectItem>
                    <SelectItem value="other">Other...</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {occasion === 'other' && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="custom-occasion">Specify Occasion</Label>
                  <Input
                    id="custom-occasion"
                    placeholder="E.g. Beach Wedding, Job Interview..."
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    className="bg-background dark:bg-muted/20"
                  />
                </div>
              )}

              <Button
                onClick={handleGetRecommendation}
                className="w-full bg-garcia-600 hover:bg-garcia-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  'Get Recommendations'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-garcia-500 bg-garcia-50 dark:bg-garcia-900/20"
                : "border-border hover:border-garcia-400 dark:hover:border-garcia-500 bg-background dark:bg-secondary/20"
            )}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-garcia-50 rounded-full">
                <UploadCloud className="h-10 w-10 text-garcia-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-lg">Upload an Image</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Upload a full-body photo for accurate body type analysis and personalized recommendations
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative"
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Select Image
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or JPEG (max. 5MB)
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
