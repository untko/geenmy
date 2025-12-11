import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryEntry } from "../types";

// Note: Ensure process.env.API_KEY is available or replaced with a valid key for testing.
// In this specific demo environment, we assume the environment variable is set.
const apiKey = process.env.API_KEY; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `
You are an expert English-Myanmar lexicographer. 
Generate dictionary entries strictly adhering to the JSON schema provided.

CRITICAL RULES:
1.  **Headwords**: MUST be lowercase (e.g., 'cap', 'apple'), unless they are proper nouns (e.g., 'Paris', 'John'). Do NOT capitalize common words.
2.  **Polysemy (Multiple Meanings)**: If a word has multiple meanings, you MUST include the most common/standard meaning as Sense 1.
    *   Example: If word is 'Ghost'. 
        *   Sense 1: 'Spirit of a dead person' (General). 
        *   Sense 2: 'To ignore someone' (Slang).
3.  **Tags**: ALWAYS include 'tags' to describe the context (e.g., 'general', 'slang', 'legal', 'food').
4.  **Translations**: Ensure Myanmar definitions are natural and use proper Unicode.
`;

// Schema definition matching DictionaryEntry
const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        headword: { type: Type.STRING, description: "The word in English (lowercase unless proper noun)" },
        source_lang: { type: Type.STRING, enum: ["en"] },
        target_lang: { type: Type.STRING, enum: ["my"] },
        phonetic_ipa: { type: Type.STRING, description: "IPA pronunciation" },
        senses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sense_id: { type: Type.STRING },
              pos: { type: Type.STRING, description: "Part of speech (noun, verb, etc.)" },
              gloss: { type: Type.STRING, description: "Short English definition/gloss" },
              definition: { type: Type.STRING, description: "Full Myanmar definition" },
              examples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    src: { type: Type.STRING, description: "English example sentence" },
                    tgt: { type: Type.STRING, description: "Myanmar translation of example" },
                    tgt_roman: { type: Type.STRING, description: "Romanization of Myanmar translation" },
                  },
                  required: ["src", "tgt"]
                }
              },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Tags describing context. MUST be an array of strings." 
              }
            },
            required: ["sense_id", "pos", "gloss", "definition", "examples", "tags"]
          }
        }
      },
      required: ["headword", "source_lang", "target_lang", "senses"]
    }
  };

export const generateWords = async (topic: string, count: number): Promise<DictionaryEntry[]> => {
  if (!ai) {
    throw new Error("API Key is missing. Cannot generate words.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate ${count} unique, intermediate-to-advanced English words related to the topic: "${topic}". 
      If a word is commonly known in general English, include its general definition first.
      Ensure the output is a valid JSON array matching the schema. 
      The target language must be Myanmar ('my').
      Do not repeat words.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as DictionaryEntry[];
    return data;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const defineWord = async (word: string): Promise<DictionaryEntry | null> => {
    if (!ai) {
      throw new Error("API Key is missing.");
    }
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Define the English word: "${word}".
        Provide a detailed dictionary entry with up to 3 senses (meanings).
        The target language must be Myanmar ('my').
        Ensure the output is a valid JSON array containing a single entry.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.3, // Lower temperature for more factual accuracy
        }
      });
  
      const text = response.text;
      if (!text) return null;
      
      const data = JSON.parse(text) as DictionaryEntry[];
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error("AI Definition Error:", error);
      return null;
    }
  };

export const checkAndCorrectEntry = async (entry: DictionaryEntry): Promise<DictionaryEntry | null> => {
    if (!ai) throw new Error("API Key missing");

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Review and correct this dictionary entry JSON: ${JSON.stringify(entry)}.
            1. Fix any typos in English or Myanmar.
            2. Ensure Myanmar translations are natural and accurate.
            3. Ensure IPA is correct.
            4. If a field is missing or empty, fill it.
            Return the corrected entry as a JSON array containing one object.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            }
        });
        
        const text = response.text;
        if (!text) return null;
        const data = JSON.parse(text) as DictionaryEntry[];
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("AI Correction Error:", error);
        throw error;
    }
};

export const enrichEntryExamples = async (entry: DictionaryEntry): Promise<DictionaryEntry | null> => {
    if (!ai) throw new Error("API Key missing");

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Take this dictionary entry: ${JSON.stringify(entry)}.
            For EVERY sense (definition) in the entry, add 2-3 NEW, high-quality examples.
            Do not remove existing examples unless they are incorrect.
            Return the updated entry as a JSON array containing one object.`,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            }
        });
        
        const text = response.text;
        if (!text) return null;
        const data = JSON.parse(text) as DictionaryEntry[];
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error("AI Enrichment Error:", error);
        throw error;
    }
};