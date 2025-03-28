import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;

export async function verifyWasteImage(
  imageBase64: string,
  mimeType: string,
  wasteType?: string,
  difficulty?: string
) {
  if (!geminiApiKey) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageParts = [{
      inlineData: {
        data: imageBase64.split(',')[1],
        mimeType
      }
    }];

    const prompt = wasteType && difficulty 
      ? `You are a strict waste verification expert. Your task is to verify waste collection efforts with high accuracy.

         Analyze this image and verify:
         1. If it CLEARLY shows collection/cleanup of ${wasteType} waste (be strict about waste type matching)
         2. Provide a precise quantity estimate in kilograms (kg)
         3. Assess if the cleanup effort matches the ${difficulty} difficulty level
         4. Look for clear evidence of actual waste collection (not just random photos)
         5. Verify the image shows recent activity (not old or stock photos)
         
         Respond with only a JSON object in this exact format (no markdown, no backticks):
         {
           "verified": true/false,
           "confidence": 0.95,
           "quantity": "2.5 kg",
           "matchesDifficulty": true/false,
           "assessment": "Detailed explanation of verification decision"
         }
         
         Be strict and conservative in your assessment. Only return verified: true if you are highly confident.`
      : `You are a strict waste management and recycling expert. Your task is to accurately identify and quantify waste in images.

         Analyze this image and provide:
         1. The SPECIFIC type of waste (e.g., PET plastic, cardboard, aluminum cans) - be precise
         2. An accurate estimate of the quantity in kilograms (kg)
         3. Your confidence level in this assessment
         4. Verify this is a real waste collection photo (not staged or stock photo)
         
         Respond with only a JSON object in this exact format (no markdown, no backticks):
         {
           "wasteType": "specific type of waste",
           "quantity": "estimated quantity in kg",
           "confidence": 0.95
         }
         
         Be conservative in your estimates and only report high confidence when truly certain.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response text by removing any markdown formatting
    const cleanJson = text.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error in verifyWasteImage:', error);
    throw error;
  }
}