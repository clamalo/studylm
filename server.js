require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const app = express();

// CORS configuration to allow the React app (localhost:3000) to access this server
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Use express.json() for parsing application/json bodies
app.use(express.json());

// Setup multer to store files in memory for easy Buffer access
const upload = multer({ storage: multer.memoryStorage() });

// Load Gemini API Key and model from env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro-exp-03-25';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define the response schema matching the Python Pydantic models
const quizSchema = {
  type: "object",
  properties: {
    question: { type: "string" },
    choices: { 
      type: "array", 
      items: { type: "string" } 
    },
    correct_answer: { type: "string" }
  },
  required: ["question", "choices", "correct_answer"]
};

const sectionSchema = {
  type: "object",
  properties: {
    section_title: { type: "string" },
    narrative: { type: "string" },
    key_points: {
      type: "array",
      items: { type: "string" }
    },
    quizzes: {
      type: "array",
      items: quizSchema
    }
  },
  required: ["section_title", "narrative", "key_points", "quizzes"]
};

const unitConceptsSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      unit: { type: "string" },
      overview: { type: "string" },
      sections: {
        type: "array",
        items: sectionSchema
      },
      unit_quiz: {
        type: "array",
        items: quizSchema
      }
    },
    required: ["unit", "overview", "sections", "unit_quiz"]
  }
};

// System instruction (matching the one from Python)
const SYSTEM_INSTRUCTION = "You are a helpful assistant specialized in extracting and synthesizing concepts from course materials. Always provide clear and organized responses. Never provide any sort of introduction or meta-level commentary. Just get straight into the response and be as thorough as possible.";

// Chat system instruction for the chat assistant
const CHAT_SYSTEM_INSTRUCTION = "You are a helpful AI tutor. Your goal is to help students understand the concepts in their course materials. Be clear, concise, and helpful in your explanations. Format your responses using markdown for better readability. Use headings, lists, code blocks, and other markdown features when appropriate. If you're unsure about something in the course materials, acknowledge that and provide the best guidance you can. Break down complex concepts into simpler terms and use examples when helpful.";

// Store active chat sessions
const chatSessions = new Map();

// Endpoint to handle chat messages
app.post('/chat', async (req, res) => {
  try {
    const { message, chat_history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'No message provided' });
    }
    
    // Read the study content JSON to provide as context
    let studyContext = '';
    try {
      const studyContentPath = path.join(__dirname, 'react-study-app', 'public', 'study_concepts.json');
      if (fs.existsSync(studyContentPath)) {
        const studyContent = JSON.parse(fs.readFileSync(studyContentPath, 'utf8'));
        // Create a condensed version of the study content for context
        studyContext = "Study content summary: " + 
          studyContent.map(unit => {
            return `Unit: ${unit.unit}\nOverview: ${unit.overview}\nKey sections: ${
              unit.sections.map(section => section.section_title).join(', ')
            }`;
          }).join('\n\n');
      }
    } catch (err) {
      console.error("Error loading study content for context:", err);
      // Continue without the study context if there's an error
    }
    
    // Set up headers for streaming response
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Create or retrieve chat session
    let sessionId = req.headers['session-id'] || 'default-session';
    let chatSession;
    
    if (!chatSessions.has(sessionId)) {
      // Create a new chat session
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.4,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });
      
      // Start a new chat session
      chatSession = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 1000,
        },
      });
      
      // Store the chat session
      chatSessions.set(sessionId, chatSession);
      
      // Add study context as first message if available
      if (studyContext) {
        try {
          await chatSession.sendMessage(
            `Here is some context about the course materials that I'm studying: ${studyContext}. 
            Please use this as reference when answering my questions. Remember to format your responses using markdown.`
          );
        } catch (error) {
          console.error("Error sending context message:", error);
        }
      }
      
      // Add previous chat history if available
      if (chat_history && chat_history.length > 0) {
        for (const historyItem of chat_history) {
          try {
            if (historyItem.sender === 'user') {
              await chatSession.sendMessage(historyItem.text);
            }
          } catch (error) {
            console.error("Error restoring chat history:", error);
          }
        }
      }
    } else {
      chatSession = chatSessions.get(sessionId);
    }
    
    // Stream the response
    try {
      const result = await chatSession.sendMessageStream(message);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(chunkText);
      }
      
      res.end();
    } catch (error) {
      console.error("Error streaming response:", error);
      res.status(500).json({ error: 'Error generating response' });
    }
  } catch (err) {
    console.error("Error processing chat request:", err);
    res.status(500).json({ error: 'Server error processing chat request' });
  }
});

// Endpoint to process uploaded files and generate study guide JSON
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Create a model with appropriate settings
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.25,  // Lower temperature for more consistent results
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    
    // Prepare parts array that will contain the file contents
    const parts = [];
    
    // Add each file as a content part
    for (const file of req.files) {
      const base64Data = file.buffer.toString('base64');
      const fileContent = {
        inlineData: {
          data: base64Data,
          mimeType: file.mimetype
        }
      };
      parts.push(fileContent);
      
      // Add spacer between files (matching Python implementation)
      parts.push({ text: "\n\n" });
    }
    
    // Add the prompt as the final part (matching the prompt from studylm.py)
    parts.push({
      text: "Organize all concepts extracted from the files into a structured study guide. The output should be a JSON array of units. Each unit must contain a 'unit' (the title of the unit) and an 'overview' that summarizes the key ideas of that unit. Each unit should also have a 'sections' array. Every section within the unit must include a 'section_title', a 'narrative' explanation that details the concepts in that section, and a 'key_points' array that lists the essential takeaways. For each section, generate three quiz questions that test understanding of the material. Each quiz question should be a JSON object with a 'question', an array of four 'choices' (all with roughly equivalent length & complexity), and a 'correct_answer' that matches one of the choices. Additionally, at the end of each unit, generate a unit-level quiz consisting of ten quiz questions in the same format. Ensure that the units progressively build on each other to form a cohesive understanding of the course material. Use information primarily from the course materials, and supplement with additional details as needed."
    });
    
    // Request JSON generation using the configured model and schema
    const result = await model.generateContent({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: unitConceptsSchema,
      },
    });
    
    const response = result.response;
    let studyConcepts = response.text();
    
    // Clean up the response by removing markdown code blocks if present
    if (studyConcepts.includes('```')) {
      studyConcepts = studyConcepts.replace(/```json\s?/g, '').replace(/```\s?/g, '');
    }
    
    // Parse the response to validate it's proper JSON
    try {
      // Parse and validate the JSON
      const parsedJSON = JSON.parse(studyConcepts);
      
      // Create directory if it doesn't exist
      const outputDir = path.join(__dirname, 'react-study-app', 'public');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Save the JSON to the public folder
      const outputPath = path.join(outputDir, 'study_concepts.json');
      fs.writeFileSync(outputPath, JSON.stringify(parsedJSON, null, 2));
      
      // Return the valid JSON to the client
      res.json({ studyConcepts: parsedJSON });
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      res.status(422).json({ 
        error: 'The generated content could not be parsed as valid JSON',
        rawOutput: studyConcepts.substring(0, 500) + (studyConcepts.length > 500 ? '...' : '')
      });
    }
  } catch (err) {
    console.error("Error processing files or calling Gemini API:", err);
    res.status(500).json({ error: 'Failed to process files' });
  }
});

// Function to start server on a given port and try the next port if it's already in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', error);
    }
  });
}

// Start the server on the desired port (default 5000)
const desiredPort = process.env.PORT || 5001; // Using 5001 as default
startServer(Number(desiredPort));
