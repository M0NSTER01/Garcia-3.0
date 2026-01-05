import React, { useState } from 'react';
import { API_KEY } from '@/services/geminiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Direct test function for Gemini text model
const testGeminiText = async (): Promise<string> => {

  try {
    // Basic text request to gemini-2.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, are you working? Please respond with Yes or No"
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return `API Error (${response.status}): ${errorText}`;
    }

    const data = await response.json();
    return `Success! Response: ${JSON.stringify(data)}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

// Function to test image models
const testGeminiImage = async (imageDataUrl: string): Promise<string> => {

  try {
    // Extract base64 data from data URL
    const base64Data = imageDataUrl.split(',')[1];
    if (!base64Data) {
      return 'Error: Could not extract base64 data from image';
    }

    // Try with gemini-2.5-flash model
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "What's in this image? Keep it very brief." },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image API error response:', errorText);
      return `API Error (${response.status}): ${errorText}`;
    }

    const data = await response.json();
    return `Success! Response: ${JSON.stringify(data)}`;
  } catch (error) {
    console.error('Image API exception:', error);
    return `Error: ${error.message}`;
  }
};

// Function to check available models
const checkAvailableModels = async (): Promise<string> => {

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return `API Error (${response.status}): ${errorText}`;
    }

    const data = await response.json();
    const models = data.models || [];

    // Create a list of available model names
    const modelNames = models.map((model: { name: string }) => model.name).join('\n');
    return `Available Models:\n${modelNames}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
};

const TestGemini = () => {
  const [textResult, setTextResult] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [modelsResult, setModelsResult] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleTextTest = async () => {
    setIsLoadingText(true);
    setTextResult(null);
    try {
      const result = await testGeminiText();
      setTextResult(result);
      toast.success('Text API test completed');
    } catch (error) {
      setTextResult(`Error: ${error.message}`);
      toast.error('Text API test failed');
    } finally {
      setIsLoadingText(false);
    }
  };

  const handleImageTest = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsLoadingImage(true);
    setImageResult(null);
    try {
      const result = await testGeminiImage(selectedImage);
      setImageResult(result);
      toast.success('Image API test completed');
    } catch (error) {
      setImageResult(`Error: ${error.message}`);
      toast.error('Image API test failed');
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleModelsCheck = async () => {
    setIsLoadingModels(true);
    setModelsResult(null);
    try {
      const result = await checkAvailableModels();
      setModelsResult(result);
      toast.success('Models check completed');
    } catch (error) {
      setModelsResult(`Error: ${error.message}`);
      toast.error('Models check failed');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Gemini API Test Page</h1>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">API Key Required</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>You need a valid Google Gemini API key to use the image analysis features.</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google AI Studio</a></li>
                <li>Sign in with your Google account</li>
                <li>Create a new API key</li>
                <li>Copy your new API key</li>
                <li>Open <code className="bg-gray-200 px-1 rounded">src/services/geminiService.ts</code> and replace <code className="bg-gray-200 px-1 rounded">YOUR_API_KEY_HERE</code> with your new key</li>
              </ol>

              <div className="mt-4 border-t border-yellow-200 pt-3">
                <h4 className="font-medium">Important Model Update</h4>
                <p className="mt-1">
                  As of July 2024, this application now uses the Gemini 2.5 Flash model since older models were deprecated.
                  This update has been applied to the codebase.
                </p>
              </div>

              <div className="mt-4 border-t border-yellow-200 pt-3">
                <h4 className="font-medium">Enabling the Gemini API</h4>
                <p className="mt-1">
                  You need to enable the Generative Language API for your Google Cloud project:
                </p>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Go to <a href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Cloud Console API Library</a></li>
                  <li>Make sure you're in the correct project</li>
                  <li>Click "Enable" to activate the Generative Language API</li>
                  <li>Wait a few minutes for the changes to take effect</li>
                </ol>
              </div>

              <div className="mt-4 border-t border-yellow-200 pt-3">
                <h4 className="font-medium">Removing API Key Restrictions</h4>
                <p className="mt-1">If your API key is restricted, you need to remove restrictions:</p>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                  <li>Select the project that contains your API key</li>
                  <li>Find your API key in the list and click on it</li>
                  <li>In the "Application restrictions" section, select "None" or add your development domain</li>
                  <li>In the "API restrictions" section, make sure Gemini API is allowed</li>
                  <li>Click "Save" to apply changes</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="text">
        <TabsList>
          <TabsTrigger value="text">Test Text API</TabsTrigger>
          <TabsTrigger value="image">Test Image API</TabsTrigger>
          <TabsTrigger value="models">Check Models</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Test Gemini Text API</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTextTest}
                disabled={isLoadingText}
              >
                {isLoadingText ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : 'Run Text API Test'}
              </Button>

              {textResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-sm">{textResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Test Gemini Image API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mb-4"
                />

                {selectedImage && (
                  <div className="mb-4">
                    <p className="text-sm mb-2">Selected Image:</p>
                    <img
                      src={selectedImage}
                      alt="Selected"
                      className="max-h-40 max-w-full object-contain rounded border"
                    />
                  </div>
                )}

                <Button
                  onClick={handleImageTest}
                  disabled={isLoadingImage || !selectedImage}
                  className="mt-2"
                >
                  {isLoadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : 'Run Image API Test'}
                </Button>
              </div>

              {imageResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-sm">{imageResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Check Available Models</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleModelsCheck}
                disabled={isLoadingModels}
              >
                {isLoadingModels ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : 'Check Available Models'}
              </Button>

              {modelsResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-96">
                  <pre className="whitespace-pre-wrap text-sm">{modelsResult}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestGemini; 