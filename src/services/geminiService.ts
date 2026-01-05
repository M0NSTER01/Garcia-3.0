import { GoogleGenerativeAI } from '@google/generative-ai';

// API key management
// ⚠️ IMPORTANT: The API key is now loaded from the .env file (VITE_GEMINI_API_KEY)
export const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the Gemini API with better error handling
let genAI;
try {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('Gemini API: Service initialized successfully with API key');
} catch (error) {
  console.error('Gemini API: Failed to initialize service:', error);
}

// Function to validate API connection
export const validateGeminiApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Gemini API: Validating API connection...');

    // Check if genAI was initialized properly
    if (!genAI) {
      console.error('Gemini API: Validation failed - API not initialized');
      return false;
    }

    // Try direct fetch first - this is the most reliable approach
    try {
      console.log('Gemini API: Attempting direct fetch validation with gemini-2.5-flash...');
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
                text: "Hello"
              }]
            }]
          })
        }
      );

      if (response.ok) {
        console.log('Gemini API: Direct fetch validation successful with gemini-2.5-flash');
        return true;
      }

      console.error(`Gemini API: Direct fetch validation failed with status ${response.status}`);

      // Try with gemini-2.5-flash (redundant fallback but keeping structure)
      console.log('Gemini API: Attempting direct fetch validation with gemini-2.5-flash...');
      const response2 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: "Hello"
              }]
            }]
          })
        }
      );

      if (response2.ok) {
        console.log('Gemini API: Direct fetch validation successful with gemini-2.5-flash');
        return true;
      }

      console.error(`Gemini API: All direct fetch validation attempts failed`);

    } catch (directError) {
      console.error('Gemini API: Direct fetch validation failed:', directError);
    }

    // Fallback to library approach as last resort
    console.log('Gemini API: Trying library validation method...');
    // Try creating a model with minimal settings
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10,
      }
    });

    // Simple test prompt
    console.log('Gemini API: Testing with simple prompt...');
    const result = await model.generateContent('Hello');
    const response = await result.response;
    const text = await response.text();

    console.log('Gemini API: Validation response:', text);

    // If we got any response, the API key is working
    if (text && text.length > 0) {
      console.log('Gemini API: Connection validated successfully');
      return true;
    } else {
      console.warn('Gemini API: Got empty response');
      return false;
    }
  } catch (error) {
    console.error('Gemini API: Validation failed with error:', error);
    // Check for specific error messages
    const errorMessage = error.toString().toLowerCase();
    if (errorMessage.includes('api key')) {
      console.error('Gemini API: Invalid API key or API key not authorized');
    } else if (errorMessage.includes('quota')) {
      console.error('Gemini API: Quota exceeded');
    } else if (errorMessage.includes('permission')) {
      console.error('Gemini API: Permission denied');
    }
    return false;
  }
};

export interface StylePreferences {
  'style-preference': string;
  'color-preference': string[];
  'clothing-items': string[];
  'occasion': string[];
  'comfort-priority': string;
}

export interface BodyMeasurements {
  height: number;
  weight: number;
  bust?: number;
  waist: number;
  hips?: number;
  shoulders?: number;
  gender: string;
}

export interface StyleRecommendation {
  bodyType: string;
  recommendations: {
    tops: string[];
    bottoms: string[];
    dresses?: string[];
    accessories: string[];
  };
  colorRecommendations?: { name: string; hex: string }[];
  error?: string; // If the API returns an error, it will be provided here.
}

export const getStyleRecommendations = async (
  measurements: BodyMeasurements,
  preferences: StylePreferences
): Promise<StyleRecommendation> => {
  try {
    console.log('Gemini API: Making style recommendations request with data:', { measurements, preferences });

    // Construct the prompt with explicit instructions to return valid JSON only.
    const prompt = `
      Provide fashion recommendations for a person with the following details:

      **Body Measurements:**
      - Height: ${measurements.height} cm
      - Weight: ${measurements.weight} kg
      ${measurements.bust ? `- Bust: ${measurements.bust} cm` : ''}
      - Waist: ${measurements.waist} cm
      ${measurements.hips ? `- Hips: ${measurements.hips} cm` : ''}
      ${measurements.shoulders ? `- Shoulders: ${measurements.shoulders} cm` : ''}
      - Gender: ${measurements.gender}

      **Style Preferences:**
      - Preferred Style: ${preferences['style-preference']}
      - Preferred Colors: ${preferences['color-preference'].join(', ')}
      - Preferred Clothing Items: ${preferences['clothing-items'].join(', ')}
      - Occasion: ${preferences['occasion'].join(', ')}
      - Comfort Priority: ${preferences['comfort-priority']}

      **Instructions:**
      - Determine the person's body type.
      - Provide 5 tops, 5 bottoms, and 5 accessories that suit their body type and preferences.
      ${measurements.gender.toLowerCase() === 'female' ? '- Also provide 5 dresses.' : ''}
      - Suggest 5 color palettes that match their preferences.
      - If the input is invalid (for example, if no person or multiple persons are detected in an image input), return a JSON object with an "error" field describing the issue.
      
      IMPORTANT: Your output MUST be a valid JSON object ONLY with no additional text, headers, or commentary.
      
      **Response Format:**
      {
        "bodyType": "body shape",
        "recommendations": {
          "tops": ["Top 1", "Top 2", "Top 3", "Top 4", "Top 5"],
          "bottoms": ["Bottom 1", "Bottom 2", "Bottom 3", "Bottom 4", "Bottom 5"],
          ${measurements.gender.toLowerCase() === 'female' ? `"dresses": ["Dress 1", "Dress 2", "Dress 3", "Dress 4", "Dress 5"],` : ''}
          "accessories": ["Accessory 1", "Accessory 2", "Accessory 3", "Accessory 4", "Accessory 5"]
        },
        "colorRecommendations": [
          { "name": "Color Name 1", "hex": "#RRGGBB" },
          { "name": "Color Name 2", "hex": "#RRGGBB" },
          { "name": "Color Name 3", "hex": "#RRGGBB" },
          { "name": "Color Name 4", "hex": "#RRGGBB" },
          { "name": "Color Name 5", "hex": "#RRGGBB" }
        ]
      }
    `;

    console.log('Gemini API: Using prompt:', prompt);

    // Call the Gemini API with the constructed prompt.
    console.log(`Gemini API: About to call gemini-2.5-flash model with API key ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 5)}`);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    console.log('Gemini API: Model loaded, generating content...');

    // This is where the actual API call happens
    console.log('Gemini API: Making API request now...');
    const result = await model.generateContent(prompt);
    console.log('Gemini API: Content generated successfully, parsing response...');

    const response = await result.response;
    const text = await response.text();
    console.log('Gemini API: Raw response text:', text);

    // Extract JSON response from the output.
    let parsedResponse: StyleRecommendation | null = null;
    const jsonMatch = text.match(/{[\s\S]*}/);
    if (jsonMatch) {
      try {
        parsedResponse = JSON.parse(jsonMatch[0]);
        console.log('Gemini API: Successfully parsed JSON response:', parsedResponse);
      } catch (error) {
        console.error('Gemini API: JSON Parsing Error:', error);
      }
    } else {
      console.error('Gemini API: No JSON object found in response');
    }

    // If no valid JSON is extracted, return an error object.
    if (!parsedResponse) {
      console.error('Gemini API: Failed to parse response');
      return {
        bodyType: '',
        recommendations: { tops: [], bottoms: [], accessories: [], ...(measurements.gender.toLowerCase() === 'female' && { dresses: [] }) },
        colorRecommendations: [],
        error: 'Failed to parse the API response. Please try again.'
      };
    }

    // If the API response contains an error, pass it through.
    if (parsedResponse.error) {
      console.error('Gemini API: Response contained error:', parsedResponse.error);
      return parsedResponse;
    }

    console.log('Gemini API: Successfully processed style recommendations');
    return parsedResponse;
  } catch (error) {
    console.error('Gemini API: Call Error:', error);
    return {
      bodyType: '',
      recommendations: { tops: [], bottoms: [], accessories: [], ...(measurements.gender.toLowerCase() === 'female' && { dresses: [] }) },
      colorRecommendations: [],
      error: 'An error occurred while fetching recommendations. Please try again later.'
    };
  }
};

// Vision prompt for image analysis
const visionPrompt = `
  You are a fashion analysis AI. Analyze this image showing a person and provide fashion recommendations based on their body type.
  The person identifies as {gender}.

  Task:
  1. Determine the person's body type or shape based on the image
  2. Provide specific clothing recommendations that would flatter this body type
  3. Suggest color recommendations that would complement the person

  IMPORTANT: Format your response as a valid JSON object ONLY with no explanations, markdown, or additional text.

  Response format:
  {
    "bodyType": "[determined body type]",
    "recommendations": {
      "tops": ["[specific top recommendation 1]", "[specific top recommendation 2]", "[specific top recommendation 3]", "[specific top recommendation 4]", "[specific top recommendation 5]"],
      "bottoms": ["[specific bottom recommendation 1]", "[specific bottom recommendation 2]", "[specific bottom recommendation 3]", "[specific bottom recommendation 4]", "[specific bottom recommendation 5]"],
      "accessories": ["[specific accessory recommendation 1]", "[specific accessory recommendation 2]", "[specific accessory recommendation 3]", "[specific accessory recommendation 4]", "[specific accessory recommendation 5]"]
    },
    "colorRecommendations": [
      { "name": "[color name 1]", "hex": "#[hex code 1]" },
      { "name": "[color name 2]", "hex": "#[hex code 2]" },
      { "name": "[color name 3]", "hex": "#[hex code 3]" },
      { "name": "[color name 4]", "hex": "#[hex code 4]" },
      { "name": "[color name 5]", "hex": "#[hex code 5]" }
    ]
  }
`;

export const analyzeImage = async (imageDataUrl: string, gender: string, occasion?: string): Promise<StyleRecommendation> => {
  console.log('Analyzing image with Gemini API...');

  try {
    // Validate the data URL format
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
      console.error('Invalid image data URL format');
      return getFallbackRecommendation(gender);
    }

    // Remove the data URL prefix to get just the base64 data
    const base64Data = imageDataUrl.split(',')[1];
    if (!base64Data) {
      console.error('Failed to extract base64 data from image URL');
      return getFallbackRecommendation(gender);
    }

    // Check if genAI was initialized
    if (!genAI) {
      console.error('Gemini API not initialized');
      return getFallbackRecommendation(gender);
    }

    // Check the API key
    if (!API_KEY) {
      console.error('Gemini API key is not set');
      return getFallbackRecommendation(gender);
    }

    // Try direct fetch first (most reliable)
    try {
      console.log('Attempting direct fetch to vision API...');

      let promptText = visionPrompt.replace("{gender}", gender);
      if (occasion) {
        promptText += `\n  The user is dressing for the following occasion: "${occasion}". Please tailor recommendations specifically for this event/context.`;
      }

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
                { text: promptText },
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
        console.error(`Vision API direct fetch failed: ${response.status}`, errorText);
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || text.trim() === '') {
        console.error('Empty response from direct vision API');
        throw new Error('Empty response');
      }

      try {
        // Try parsing the JSON directly
        return JSON.parse(text) as StyleRecommendation;
      } catch (parseError) {
        console.error('Failed to parse direct vision API response as JSON', parseError);

        // Try extracting JSON from text if it contains JSON within markdown or text
        const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) ||
          text.match(/{[\s\S]*?}/);

        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1]) as StyleRecommendation;
          } catch (e) {
            console.error('Failed to parse extracted JSON from direct response', e);
            throw e;
          }
        }
        throw new Error('Failed to parse JSON from response');
      }
    } catch (directFetchError) {
      console.error('Direct fetch to vision API failed:', directFetchError);
      // Fall through to library approach
    }

    // Try models in order of preference using the library approach as fallback
    const modelsToTry = ["gemini-2.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting to use ${modelName} model via library...`);

        const result = await genAI
          .getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.4,
              topP: 0.8,
              topK: 32,
              maxOutputTokens: 2048,
            },
          })
          .generateContent([
            visionPrompt.replace("{gender}", gender),
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Data
              }
            }
          ]);

        console.log(`${modelName} model successfully processed the image`);

        const response = await result.response;
        const text = response.text();

        if (!text || text.trim() === '') {
          console.error(`Empty response from ${modelName} model`);
          continue; // Try next model
        }

        try {
          // Try parsing the JSON directly
          return JSON.parse(text) as StyleRecommendation;
        } catch (parseError) {
          console.error(`Failed to parse ${modelName} model response as JSON`, parseError);

          // Try extracting JSON from text if it contains JSON within markdown or text
          const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) ||
            text.match(/{[\s\S]*?}/);

          if (jsonMatch && jsonMatch[1]) {
            try {
              return JSON.parse(jsonMatch[1]) as StyleRecommendation;
            } catch (e) {
              console.error(`Failed to parse extracted JSON from ${modelName} response`, e);
              // Continue to try the next model
            }
          }
        }
      } catch (modelError) {
        console.error(`Error with ${modelName} model:`, modelError);
        lastError = modelError;
        // Continue to try the next model
      }
    }

    // If we get here, all attempts failed
    console.error('All vision API attempts failed, using fallback recommendation', lastError);
    return getFallbackRecommendation(gender);
  } catch (error) {
    console.error('Error analyzing image with Gemini Vision API:', error);
    return getFallbackRecommendation(gender);
  }
};

// Chat functionality
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  text: string;
  updatedRecommendation?: any;
}

export const chatWithStyleAdvisor = async (
  currentRecommendation: any,
  history: ChatMessage[],
  userMessage: string
): Promise<ChatResponse> => {
  try {
    console.log('Gemini API: Sending chat message to Style Advisor...');

    // Construct the prompt
    const prompt = `
      You are an expert Style Advisor AI. You have provided a style recommendation to a user, and now you are discussing it with them.
      
      **Current Recommendation Context:**
      ${JSON.stringify(currentRecommendation, null, 2)}
      
      **Conversation History:**
      ${history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}
      USER: ${userMessage}
      
      **Instructions:**
      1. Answer the user's question or respond to their feedback politely and professionally.
      2. If the user is asking to CHANGE or UPDATE the recommendation (e.g., "give me brighter colors", "I don't like dresses"), you MUST provide an updated JSON recommendation.
      3. If the user is just asking a question (e.g., "why this color?"), you DO NOT need to provide a JSON update.
      
      **Response Format:**
      You must return a JSON object with the following structure:
      {
        "text": "Your conversational response here...",
        "updatedRecommendation": { ... } // OPTIONAL: Include only if the recommendation needs to change based on user input
      }
      
      IMPORTANT: Your output MUST be a valid JSON object ONLY.
    `;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash', // Use flash for faster chat responses
      generationConfig: {
        temperature: 0.7, // Slightly higher creative freedom for chat
        maxOutputTokens: 2048,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini API: Chat response received:', text);

    // Parse the JSON response
    try {
      // Clean the text in case it has markdown code blocks
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsed: ChatResponse = JSON.parse(cleanText);
      return parsed;
    } catch (parseError) {
      console.error('Gemini API: Failed to parse chat response:', parseError);
      // Fallback if the model didn't return JSON
      return {
        text: "I understood your request, but I'm having trouble processing the update. Could you try rephrasing?"
      };
    }
  } catch (error) {
    console.error('Gemini API: Chat error:', error);
    return {
      text: "I'm sorry, I encountered an error while processing your message. Please try again."
    };
  }
};

// Test with Raw fetch for a guaranteed working API call
export const testApiWithRawFetch = async (): Promise<boolean> => {
  try {
    console.log('Testing direct API connection with raw fetch (gemini-2.5-flash)...');
    // Try with gemini-2.5-flash first
    const responsePro = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello, are you working?"
            }]
          }]
        })
      }
    );

    if (responsePro.ok) {
      console.log('Direct API test successful with gemini-2.5-flash');
      return true;
    }

    console.log(`API direct test with gemini-2.5-flash failed with status: ${responsePro.status}`);

    // Try with gemini-2.5-flash as fallback
    console.log('Testing direct API connection with raw fetch (gemini-2.5-flash)...');
    const responseFlash = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Hello"
            }]
          }]
        })
      }
    );

    if (responseFlash.ok) {
      console.log('Direct API test successful with gemini-2.5-flash');
      return true;
    }

    console.error(`All API direct tests failed`);
    return false;
  } catch (error) {
    console.error('API direct test failed with error:', error);
    return false;
  }
};

// Helper function to test API connection with better error handling
const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Gemini API connection...');

    // Check if genAI was initialized properly
    if (!genAI) {
      console.error('API connection test failed: Gemini API not initialized');
      return false;
    }

    // First try a simple text prompt to verify basic connectivity
    try {
      const testModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          maxOutputTokens: 10,
        }
      });

      const testResult = await testModel.generateContent('Test');
      console.log('Basic API test successful');
    } catch (testError) {
      console.error('Basic API test failed:', testError);
      return false;
    }

    // Then check available models
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

      if (!response.ok) {
        console.error(`API models endpoint failed with status: ${response.status}`);
        if (response.status === 403) {
          console.error('API key may not have proper permissions or quota');
        }
        return false;
      }

      const data = await response.json();
      console.log('Available models:', data.models?.map((m: { name: string }) => m.name).join(', '));

      // Check for our target models
      const hasGemini25Flash = data.models?.some((model: { name: string }) =>
        model.name?.includes('gemini-2.5-flash')
      );

      if (!hasGemini25Flash) {
        console.error('gemini-2.5-flash is not available');
        return false;
      }

      return true;
    } catch (error) {
      console.error('API models endpoint failed with error:', error);
      return false;
    }
  } catch (error) {
    console.error('API connection test failed with error:', error);
    return false;
  }
};

// Placeholder function for image description extraction.
// Replace this with an actual implementation that uses an image recognition service.
async function getImageDescription(imageBase64: string): Promise<string> {
  // For demonstration, return a static description.
  return "A clear image of a single person with a casual posture wearing modern clothing.";
}

// Helper function to provide a fallback recommendation
const getFallbackRecommendation = (gender: string): StyleRecommendation => {
  console.log('Gemini API: Using fallback recommendation for gender:', gender);

  const isFemale = gender.toLowerCase() === 'female';

  if (isFemale) {
    // Female-specific recommendations
    return {
      bodyType: 'Balanced',
      recommendations: {
        tops: [
          "V-neck blouses that elongate the neckline",
          "Wrap tops that accentuate the waistline",
          "Fitted button-up shirts with defined waistlines",
          "Boat-neck tops that highlight collarbones",
          "Peplum tops that create curves"
        ],
        bottoms: [
          "High-waisted straight-leg jeans",
          "A-line skirts that hit just above the knee",
          "Tailored trousers with a slight flare",
          "Pencil skirts that follow your curves",
          "Wide-leg pants with a structured waist"
        ],
        dresses: [
          "Wrap dresses that highlight your waistline",
          "A-line dresses with defined waists",
          "Fit-and-flare styles for a classic silhouette",
          "Sheath dresses for a sleek, professional look",
          "V-neck maxi dresses for elegant occasions"
        ],
        accessories: [
          "Statement belts to highlight the waist",
          "Delicate necklaces that draw attention to your neckline",
          "Stud or drop earrings to frame your face",
          "Structured handbags that complement your proportions",
          "Scarves that add color and dimension to outfits"
        ]
      },
      colorRecommendations: [
        { name: "Navy blue", hex: "#000080" },
        { name: "Burgundy", hex: "#800020" },
        { name: "Emerald green", hex: "#50C878" },
        { name: "Soft blush pink", hex: "#F4C2C2" },
        { name: "Classic black", hex: "#000000" }
      ]
    };
  } else {
    // Male-specific recommendations
    return {
      bodyType: 'Athletic',
      recommendations: {
        tops: [
          "Fitted crew-neck t-shirts in solid colors",
          "Button-up shirts with a tailored fit",
          "V-neck sweaters for casual occasions",
          "Structured blazers for formal settings",
          "Polo shirts with a slight taper"
        ],
        bottoms: [
          "Straight-leg or slim-fit jeans in dark wash",
          "Tailored chinos in neutral colors",
          "Fitted dress pants for professional settings",
          "Athletic-fit trousers with a slight stretch",
          "Shorts that hit just above the knee"
        ],
        accessories: [
          "Leather belt with a simple buckle",
          "Classic watch with a leather or metal band",
          "Subtle tie clips for formal occasions",
          "High-quality sunglasses that fit your face shape",
          "Minimal leather wallet or cardholder"
        ]
      },
      colorRecommendations: [
        { name: "Navy blue", hex: "#000080" },
        { name: "Charcoal gray", hex: "#36454F" },
        { name: "Olive green", hex: "#808000" },
        { name: "Burgundy", hex: "#800020" },
        { name: "Crisp white", hex: "#FFFFFF" }
      ]
    };
  }
};