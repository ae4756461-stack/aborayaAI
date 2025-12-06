import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants.ts";

// Initialize the Gemini Client
// We ensure process.env.API_KEY exists or use an empty string to prevent initial crash, 
// though actual calls will fail without a valid key.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Creates a new chat session with the specific Aboraya persona.
 */
export const createChatSession = (): Chat => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7, // Good balance for a friendly assistant
    },
  });
};

/**
 * Sends a message to the model and yields chunks of text as they stream in.
 */
export async function* sendMessageStream(
  chat: Chat,
  message: string
): AsyncGenerator<string, void, unknown> {
  try {
    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      // Cast strictly to ensure type safety based on library behavior
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        yield c.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}