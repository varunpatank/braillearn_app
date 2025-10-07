// Simple test to check Gemini API connection
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyBcHWSOHqa3G1g9pNjRBXYjE38pobhgfEo';

async function testGeminiConnection() {
  console.log('Testing Gemini API connection...');
  
  if (!API_KEY) {
    console.error('No API key found');
    return;
  }
  
  console.log('API Key preview:', API_KEY.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try different model names
    const modelNames = [
      'gemini-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'models/gemini-pro',
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro'
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTesting model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent('Hello, respond with just "OK" if you can hear me.');
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ Success with ${modelName}:`, text);
        return; // Exit on first success
        
      } catch (modelError) {
        console.log(`❌ Failed with ${modelName}:`, modelError.message);
      }
    }
    
    console.log('All models failed');
    
  } catch (error) {
    console.error('General error:', error);
  }
}

testGeminiConnection();