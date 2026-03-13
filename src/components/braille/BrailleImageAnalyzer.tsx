import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, X, Eye, Sparkles, GraduationCap } from 'lucide-react';
import { openRouterService } from '../../services/openRouterService';

interface BrailleImageAnalyzerProps {
  onAnalysisComplete?: (result: string, extractedText?: string) => void;
}

const BrailleImageAnalyzer: React.FC<BrailleImageAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useCallback(async (base64Image: string) => {
    setAnalyzing(true);
    setError(null);

    try {
      const result = await openRouterService.analyzeImage(
        base64Image,
        `You are BrailleLearn Intelligence — a smart tutor. A student has uploaded an image. Analyze it and respond in this structured format:

📖 **What I See:**
Describe what's in the image — is it braille text, a braille sign, a label, an embossed document, or something else?

🔤 **Translation:**
If braille is present, translate each character to English. Show the braille character → letter mapping (e.g., ⠓ → H, ⠑ → E). If no braille is found, say so.

🧠 **How It Works:**
Explain the dot patterns using the standard 6-dot braille cell (dots 1-2-3 on the left, 4-5-6 on the right). Teach the student how each character is formed.

🎓 **Learn More:**
Share an interesting fact or tip related to what was found — e.g., Grade 2 braille contractions, braille history, or real-world usage of this text.

Keep your tone friendly, encouraging, and educational. If the image is unclear or contains no braille, kindly explain what you see and suggest the student try again with a clearer image.`
      );

      setAnalysisResult(result);

      if (onAnalysisComplete) {
        const textMatch = result.match(/reads?[:\s]+"([^"]+)"/i) || 
                         result.match(/says?[:\s]+"([^"]+)"/i) ||
                         result.match(/text[:\s]+"([^"]+)"/i) ||
                         result.match(/Translation[:\s]*\n+([^\n]+)/i);
        const extractedText = textMatch ? textMatch[1] : undefined;
        onAnalysisComplete(result, extractedText);
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setError('Failed to analyze the image. Please try again with a clearer image.');
    } finally {
      setAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setSelectedImage(base64Image);
        setAnalysisResult(null);
        setError(null);
        analyzeImage(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Braille Image Analyzer</h3>
          <p className="text-sm text-gray-600">Upload a braille image — BrailleLearn Intelligence will describe, translate & teach</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          id="braille-image-input"
        />
        
        {!selectedImage ? (
          <label
            htmlFor="braille-image-input"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-blue-700 font-semibold mb-1">Upload a braille image</p>
              <p className="text-sm text-blue-500">BrailleLearn Intelligence will instantly analyze, translate & teach you</p>
              <p className="text-xs text-blue-400 mt-1">PNG, JPG, or WEBP (max 5MB)</p>
            </motion.div>
          </label>
        ) : (
          <div className="relative">
            <img
              src={selectedImage}
              alt="Selected braille image"
              className="w-full h-48 object-contain rounded-xl border-2 border-blue-200 bg-gray-50"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <p className="font-semibold text-blue-800">Analyzing your image...</p>
                <p className="text-sm text-blue-600">Describing, translating & preparing your lesson</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            <p className="font-semibold">⚠️ {error}</p>
            <button
              onClick={() => selectedImage && analyzeImage(selectedImage)}
              className="mt-2 text-sm underline text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4"
          >
            <div className="bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 border-2 border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-green-800">BrailleLearn Intelligence Tutor</h4>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {analysisResult}
              </div>
            </div>
            
            <div className="flex gap-2 mt-3">
              <button
                onClick={clearImage}
                className="flex-1 py-2.5 px-4 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload Another Image
              </button>
              <button
                onClick={() => selectedImage && analyzeImage(selectedImage)}
                className="py-2.5 px-4 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Re-analyze
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedImage && (
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700 font-medium">💡 Tips for best results:</p>
          <ul className="text-xs text-blue-600 mt-1 space-y-1">
            <li>• Use a clear, well-lit photo of the braille text</li>
            <li>• Ensure the braille dots are clearly visible</li>
            <li>• Avoid blurry or angled images</li>
            <li>• Higher resolution images work better</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BrailleImageAnalyzer;