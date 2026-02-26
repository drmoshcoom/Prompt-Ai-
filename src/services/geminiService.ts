import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const getAI = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};

export const refinePrompt = async (prompt: string, style?: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `Refine this image generation prompt to be more professional, descriptive, and effective. 
    Original prompt: "${prompt}"
    ${style ? `Style: ${style}` : ""}
    Return only the refined prompt text.`,
  });
  return response.text || prompt;
};

export const suggestKeywords = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `Based on this image prompt: "${prompt}", suggest 5-8 relevant keywords or modifiers (e.g., lighting, camera angle, texture) that would enhance it. 
    Return as a JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  try {
    return JSON.parse(response.text || "[]") as string[];
  } catch (e) {
    return [];
  }
};

export const analyzeImageForPrompt = async (base64Image: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(",")[1] || base64Image,
          },
        },
        { text: "Analyze this image and generate a highly detailed prompt that could recreate a similar style and composition. Focus on lighting, subject, mood, and technical details." },
      ],
    },
  });
  return response.text || "";
};

export const getComplexPromptAdvice = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: query,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });
  return response.text || "";
};

export const generateVisualPreview = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: `صف في 2-3 جمل حيوية كيف ستبدو الصورة التي تم إنشاؤها من هذا البرومبت: "${prompt}". ركز على التكوين البصري والجو العام. أجب باللغة العربية.`,
  });
  return response.text || "";
};
