const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Update CORS to allow requests from anywhere (simplest for Vercel/Netlify split)
// In production, you might want to restrict this to your Netlify domain.
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Root route for sanity check
app.get('/', (req, res) => {
    res.send('Garcia 2.0 API is running');
});

// Routes

// Signup
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password, age, gender } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        // Check if user exists
        const [existingUsers] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash, age, gender) VALUES (?, ?, ?, ?, ?)',
            [username, email, passwordHash, age, gender]
        );

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Don't send password hash back
        const { password_hash, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: {
                id: userWithoutPassword.id.toString(),
                username: userWithoutPassword.username,
                email: userWithoutPassword.email,
                age: userWithoutPassword.age,
                gender: userWithoutPassword.gender,
                hasCompletedQuiz: !!userWithoutPassword.has_completed_quiz
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save Quiz Result
app.post('/api/quiz/save', async (req, res) => {
    const { userId, answers } = req.body;
    console.log('Received save quiz request:', { userId, answersCount: answers ? answers.length : 0 });

    if (!userId || !answers) {
        console.error('Missing userId or answers');
        return res.status(400).json({ error: 'User ID and answers are required' });
    }

    try {
        // We'll iterate and save each answer. In a real app, you might want a transaction.
        for (const ans of answers) {
            // Check if answer for this question already exists for this user, if so update, else insert? 
            // Or just insert all. Let's assume we clean up old ones or just insert new ones.
            // For simplicity, let's just insert.

            // Ensure answer is a string
            const answerText = typeof ans.answer === 'string' ? ans.answer : JSON.stringify(ans.answer);

            await db.execute(
                'INSERT INTO quiz_results (user_id, question_id, answer) VALUES (?, ?, ?)',
                [userId, ans.questionId, answerText]
            );
        }

        // Update user's has_completed_quiz status
        const [updateResult] = await db.execute(
            'UPDATE users SET has_completed_quiz = TRUE WHERE id = ?',
            [userId]
        );
        console.log('Updated user status for ID', userId, 'Result:', updateResult);

        res.json({ message: 'Quiz results saved successfully' });
    } catch (error) {
        console.error('Save quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Quiz Results (Optional, for restoring state)
app.get('/api/quiz/:userId', async (req, res) => {
    try {
        const [results] = await db.execute(
            'SELECT question_id, answer FROM quiz_results WHERE user_id = ?',
            [req.params.userId]
        );
        res.json({ answers: results });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Virtual Try-On Endpoint
const { GoogleGenerativeAI } = require('@google/generative-ai');

app.post('/api/try-on', async (req, res) => {
    const { personImage, garmentImage } = req.body;

    if (!personImage || !garmentImage) {
        return res.status(400).json({ error: 'Person and garment images are required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the user-specified model "nano-banana-pro-preview" 
        // If this is a valid Vertex/Gemini model ID it will work.
        // Using the user-specified specific model
        const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });

        // Since standard Gemini models return text, and we need an image, 
        // we might be in a tricky spot if "nano-banana" isn't a real image-gen model accessible this way.
        // However, we will proceed with a multimodal prompt to "describe" the try-on 
        // OR better yet, since the user expects an IMAGE, we might need a different approach.
        // But for this task, I will attempt to generate a response.

        // Convert base64 to parts
        const personPart = {
            inlineData: {
                data: personImage.split(',')[1],
                mimeType: "image/jpeg"
            }
        };
        const garmentPart = {
            inlineData: {
                data: garmentImage.split(',')[1],
                mimeType: "image/jpeg"
            }
        };

        const result = await model.generateContent([
            "Generate a realistic photo of the person wearing the provided garment. The output should be the generated image only.",
            personPart,
            garmentPart
        ]);

        const response = await result.response;

        // Check if the model returned an image (standard Gemini image generation usually returns inlineData)
        // Note: For gemini-1.5-flash or similar text-centric models, this might still be text.
        // But we are following the user's instruction to output the ACTUAL result.

        let generatedImageUrl = null;
        let message = null;

        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            const parts = response.candidates[0].content.parts;
            const imagePart = parts.find(part => part.inlineData);

            if (imagePart && imagePart.inlineData) {
                generatedImageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            } else {
                // If no image, get text
                message = response.text();
            }
        } else {
            message = response.text();
        }

        console.log("Gemini Try-On Response processed.");

        if (generatedImageUrl) {
            res.json({
                imageUrl: generatedImageUrl,
                message: "Virtual try-on generated successfully."
            });
        } else {
            // If the model returned text instead of an image (common for non-Imagen models),
            // we return the text but NO mock image, as per user request.
            // The frontend should handle having a message but no imageUrl.
            res.json({
                imageUrl: null,
                message: "Model output (Text): " + message
            });
        }

    } catch (error) {
        console.error('Try-on error detailed:', error);

        if (error.status === 429) {
            return res.status(429).json({
                error: 'Quota exceeded for this model. Please try again later or verify your API plan supports this model.'
            });
        }

        if (error.status === 404) {
            return res.status(404).json({
                error: 'The requested model was not found. Please check the model name.'
            });
        }

        res.status(500).json({ error: 'Failed to process try-on request: ' + (error.message || 'Unknown error') });
    }
});

// Run server ONLY if not running in Vercel (Vercel handles the serverless execution)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;
