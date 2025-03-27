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
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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
        temperature: 0.4,  // Lower temperature for more consistent results
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
    
    console.log("Starting file processing with model:", GEMINI_MODEL);
    
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
      text: "Organize all concepts extracted from the files into a structured study guide. The output should be a JSON array of units. Each unit must contain a 'unit' (the title of the unit) and an 'overview' that summarizes the key ideas of that unit. Each unit should also have a 'sections' array. Every section within the unit must include a 'section_title', a 'narrative' explanation that details the concepts in that section, and a 'key_points' array that lists the essential takeaways. For each section, generate three quiz questions that test understanding of the material. Each quiz question should be a JSON object with a 'question', an array of four 'choices', and a 'correct_answer' that matches one of the choices. Additionally, at the end of each unit, generate a unit-level quiz consisting of ten quiz questions in the same format. Ensure that the units progressively build on each other to form a cohesive understanding of the course material. Use information primarily from the lecture slides, and supplement with additional details as needed."
    });
    
    console.log(`Processing ${req.files.length} files...`);
    
    // Request JSON generation using the configured model and schema
    const result = await model.generateContent({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: unitConceptsSchema,
      },
    });
    
    const response = result.response;
    // print the response to the console
    console.log("Response received from Gemini API");
    console.log("Response body:", response.text());
    let studyConcepts = response.text();
    
    console.log("Generation completed successfully");
    
    // Clean up the response by removing markdown code blocks if present
    if (studyConcepts.includes('```')) {
      console.log("Removing markdown code blocks from response");
      studyConcepts = studyConcepts.replace(/```json\s?/g, '').replace(/```\s?/g, '');
    }
    
    // Parse the response to validate it's proper JSON
    try {
      console.log("Parsing JSON response.,..");
      // Parse and validate the JSON
      const parsedJSON = JSON.parse(studyConcepts);
      console.log(`Generated ${parsedJSON.length} study units`);
      
      // Create directory if it doesn't exist
      const outputDir = path.join(__dirname, 'react-study-app', 'public');
      if (!fs.existsSync(outputDir)) {
        console.log(`Creating directory: ${outputDir}`);
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Verify the correct path
      console.log(`Current directory: ${__dirname}`);
      console.log(`Target directory: ${outputDir}`);
      
      // Save the JSON to the public folder
      const outputPath = path.join(outputDir, 'study_concepts.json');
      fs.writeFileSync(outputPath, JSON.stringify(parsedJSON, null, 2));
      console.log(`Saved study concepts to ${outputPath}`);
      
      // Return the valid JSON to the client
      res.json({ studyConcepts: parsedJSON });
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      console.error("Raw JSON content:", studyConcepts);
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