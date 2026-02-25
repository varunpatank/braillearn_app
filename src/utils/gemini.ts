import { GoogleGenerativeAI } from "@google/generative-ai";

// Direct Gemini API key for vision/image verification
const GEMINI_API_KEY = 'AIzaSyCCZPE80G0FqZ5Elz5qVEJcdERnelN4lyU';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function verifyWasteImage(
  imageBase64: string,
  mimeType: string,
  wasteType?: string,
  difficulty?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageParts = [{
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
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
    
    const cleanJson = text.replace(/```json\s*|\s*```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error in verifyWasteImage:', error);
    throw error;
  }
}

/**
 * Verify braille in user-submitted images using Gemini Vision.
 */
export async function verifyBrailleImage(
  imageBase64: string,
  mimeType: string,
  expectedText?: string
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageParts = [{
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType
      }
    }];

    const expectation = expectedText
      ? `Also check whether the braille transcription matches the expected text: "${expectedText}" and set matchesExpected true/false.`
      : `If possible, attempt to transcribe short braille content found in the image.`;

    const prompt = `You are an expert in braille accessibility and tactile design. Analyze the provided image and answer strictly with a JSON object (no markdown, no backticks) using the schema described below.

    Tasks:
    1) Determine whether the image contains genuine braille (isBraille)
    2) If braille is present, judge whether it is readable (readable) and whether spacing and dot-height appear sufficient for tactile reading (spacingOk)
    3) Judge whether the placement is meaningful and accessibility-focused (placementAppropriate)
    4) If expected text is provided, check matching accuracy
    5) Return a confidence score (0-1) and an overall numeric score (0-100)
    6) Provide a short human-friendly assessment and suggested fixes (if any)

    Required JSON response format:
    {
      "isBraille": true|false,
      "readable": true|false,
      "matchesExpected": true|false|null,
      "placementAppropriate": true|false,
      "spacingOk": true|false,
      "confidence": 0.0-1.0,
      "assessment": "concise explanation",
      "suggestedFixes": ["fix 1", "fix 2"],
      "score": 0-100
    }

    ${expectation}

    Be conservative: only return isBraille=true when you are confident. Prioritize accessibility best practices.`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\s*|\s*```/g, '').trim();

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) return JSON.parse(m[0]);
      throw parseErr;
    }
  } catch (error) {
    console.error('Error in verifyBrailleImage:', error);
    throw error;
  }
}
