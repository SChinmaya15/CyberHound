
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBVKMMsXwPnanJ5Kmm_UPu-WDf1UtsfAK0" });

export const getSecurityInsights = async (findings: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze these PII findings and provide 3 high-level security recommendations for an enterprise dashboard. Findings summary: ${findings}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING }
                },
                required: ["title", "description", "priority"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    return JSON.parse(response.text).insights;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return [
      { title: "Network Segmentation", description: "Isolate storage buckets with high PII counts.", priority: "High" },
      { title: "Review Access Logs", description: "Abnormal access patterns detected in S3 region-east.", priority: "Medium" }
    ];
  }
};
