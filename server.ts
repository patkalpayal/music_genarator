import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI server-side with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Project Tutor chat API endpoint
app.post("/api/tutor/chat", async (req: express.Request, res: express.Response) => {
  try {
    const { messages, codeContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    // Format chat messages for Gemini @google/genai SDK
    // It accepts standard { role: "user" | "model", parts: [{ text: "..." }] } format
    const formattedMessages = messages.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    // Add code context and instructions as system instruction
    const systemInstruction = `You are an expert AI, Machine Learning, and Python Music Generation Assistant. You are supervising an intern completing their project titled "Music Generation with AI".
Your goals are to:
1. Explain the Python LSTM music generation codebase (which uses music21, TensorFlow/Keras, and NumPy).
2. Help the user customize, debug, or understand the training parameters (epochs, learning rate, LSTM units, sequence length, etc.).
3. Answer questions about music21 library, midi format, notes/chords processing, and deep learning principles.
4. Keep your explanations highly intuitive, beginner-friendly, and engaging.

Here is the current python project context for your reference:
${codeContext || "The codebase consists of requirements.txt, midi_generator.py (dataset generation), preprocess.py (data loading), model.py (LSTM definition), train.py (model training), and generate.py (melody generation)."}

Be friendly, professional, and clear! Avoid dry developer jargon unless asked. Give scannable, nicely formatted Markdown responses.`;

    // Create a standard generateContent call using gemini-3.5-flash as default
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ content: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with the AI Tutor." });
  }
});

// Vite middleware and static asset routing
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

initServer().catch(err => {
  console.error("Failed to start server:", err);
});
