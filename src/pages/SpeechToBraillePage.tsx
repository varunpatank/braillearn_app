import React, { useState, useEffect } from 'react';
import { Download, Copy, Settings, FileDown as FileDown3D, Camera } from 'lucide-react';
import SpeechRecognition from '../components/speech/SpeechRecognition';
import BrailleWord from '../components/braille/BrailleWord';
import BrailleModelViewer from '../components/braille/BrailleModelViewer';
import BrailleImageAnalyzer from '../components/braille/BrailleImageAnalyzer';
import { useAppContext } from '../context/AppContext';
import { SpeechRecognitionResult, BrailleCell } from '../types/types';
import { translateTextToBraille } from '../services/brailleTranslator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { generateBraillePdf, downloadPdf } from '../services/pdfGenerator';

const SpeechToBraillePage: React.FC = () => {
  const { isArduinoConnected, sendBraillePattern } = useAppContext();
  const [recognizedText, setRecognizedText] = useState('');
  const [_isFinalResult, setIsFinalResult] = useState(false);
  const [brailleResult, setBrailleResult] = useState<BrailleCell[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPdfSettings, setShowPdfSettings] = useState(false);
  const [showImageAnalyzer, setShowImageAnalyzer] = useState(false);
  const [pdfOptions, setPdfOptions] = useState<{
    title: string;
    includeText: boolean;
    doubleSided: boolean;
    paperSize: 'letter' | 'a4' | 'legal';
    is3D: boolean;
    dotHeight: number;
    dotDiameter: number;
    baseThickness: number;
  }>({
    title: 'Braille Document',
    includeText: true,
    doubleSided: false,
    paperSize: 'letter',
    is3D: false,
    dotHeight: 0.5,
    dotDiameter: 1.5,
    baseThickness: 1.0
  });

  useEffect(() => {
    document.title = 'Speech to Braille Converter - BrailleLearn';
    window.scrollTo(0, 0);
  }, []);

  const handleSpeechResult = (result: SpeechRecognitionResult) => {
    setRecognizedText(result.transcript);
    setIsFinalResult(result.isFinal);
    
    if (result.isFinal) {
      translateSpeechToBraille(result.transcript);
    }
  };

  const handleImageAnalysisComplete = (_result: string, extractedText?: string) => {
    if (extractedText) {
      setRecognizedText(extractedText);
      translateSpeechToBraille(extractedText);
    }
  };

  const translateSpeechToBraille = async (text: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const brailleCells = await translateTextToBraille(text);
      setBrailleResult(brailleCells);
      
      if (isArduinoConnected && brailleCells.length > 0 && brailleCells[0].length > 0) {
        const firstCell = brailleCells[0][0];
        if (firstCell?.dots) {
          console.log('Sending first letter to Arduino:', firstCell.dots);
          await sendBraillePattern(firstCell.dots);
        }
      }
    } catch (err) {
      setError('Failed to translate text to braille. Please try again.');
      console.error('Translation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTranslate = () => {
    if (recognizedText.trim()) {
      translateSpeechToBraille(recognizedText);
    }
  };

  const handleClear = () => {
    setRecognizedText('');
    setBrailleResult([]);
    setError(null);
  };

  const handleCopyBraille = () => {
    navigator.clipboard.writeText(recognizedText)
      .then(() => alert('Text copied to clipboard!'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-50 braille-bg">
      <section className="bg-gradient-to-b from-green-500 to-blue-500 text-white py-12 relative rounded-b-3xl shadow-lg">
        <div className="absolute inset-0 braille-bg opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl font-extrabold leading-tight mb-4 flex items-center justify-center gap-2">
            <span>🦉</span> Speech to Braille Converter
          </h1>
          <p className="text-lg text-blue-100 font-medium">
            Speak, type, or upload an image to convert to braille
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center gap-4 mt-8 mb-4">
          <button
            onClick={() => setShowImageAnalyzer(false)}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              !showImageAnalyzer
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-green-700 border-2 border-green-300 hover:bg-green-50'
            }`}
          >
            🎤 Speech/Text
          </button>
          <button
            onClick={() => setShowImageAnalyzer(true)}
            className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
              showImageAnalyzer
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-blue-700 border-2 border-blue-300 hover:bg-blue-50'
            }`}
          >
            <Camera className="w-5 h-5" /> Image Analysis
          </button>
        </div>

        {showImageAnalyzer && (
          <div className="mb-8">
            <BrailleImageAnalyzer onAnalysisComplete={handleImageAnalysisComplete} />
          </div>
        )}

        {!showImageAnalyzer && (
          <div className="bg-white rounded-3xl shadow-xl border-2 border-green-400 p-8 mb-8">
            <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <span>🎤</span> Speak or Type
            </h2>
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <SpeechRecognition
                  onResult={handleSpeechResult}
                  onError={(errorMsg) => setError(errorMsg)}
                  stopAfterResult={false}
                  continuous={true}
                />
              </div>
              <div className="flex-1">
                <label htmlFor="manual-text" className="block text-sm font-semibold text-green-700 mb-1">
                  Or type text manually:
                </label>
                <textarea
                  id="manual-text"
                  value={recognizedText}
                  onChange={(e) => setRecognizedText(e.target.value)}
                  className="w-full h-32 border-2 border-green-300 rounded-xl shadow-md p-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Type text to convert to braille..."
                ></textarea>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={handleClear}
                    className="px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm hover:bg-green-200 font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleManualTranslate}
                    className="px-3 py-1 bg-green-500 rounded-full text-white text-sm hover:bg-green-600 font-bold shadow-lg"
                    disabled={!recognizedText.trim()}
                  >
                    Translate
                  </button>
                </div>
              </div>
            </div>
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4 font-semibold">
                {error}
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-900 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
              <span>⠿</span> Braille Output
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPdfSettings(!showPdfSettings)}
                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full"
                title="PDF Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={handleCopyBraille}
                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full"
                title="Copy to clipboard"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={() => {
                  const pdfUrl = generateBraillePdf(brailleResult, {
                    ...pdfOptions,
                    is3D: false
                  });
                  downloadPdf(pdfUrl, `${pdfOptions.title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
                }}
                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full"
                title="Download PDF"
                disabled={brailleResult.length === 0}
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => {
                  const stlUrl = generateBraillePdf(brailleResult, {
                    ...pdfOptions,
                    is3D: true
                  });
                  downloadPdf(stlUrl, `${pdfOptions.title.toLowerCase().replace(/\s+/g, '-')}.stl`);
                }}
                className="p-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full"
                title="Download 3D Model"
                disabled={brailleResult.length === 0}
              >
                <FileDown3D size={18} />
              </button>
            </div>
          </div>

          {showPdfSettings && (
            <div className="mb-4 p-4 bg-green-50 rounded-2xl border-2 border-green-400 shadow-lg">
              <h3 className="font-bold text-green-700 mb-3">PDF Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={pdfOptions.title}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, title: e.target.value })}
                    className="w-full border-2 border-green-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeText"
                    checked={pdfOptions.includeText}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeText: e.target.checked })}
                    className="rounded text-green-600"
                  />
                  <label htmlFor="includeText" className="ml-2 text-sm text-green-700 font-semibold">
                    Include text alongside braille
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is3D"
                    checked={pdfOptions.is3D}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, is3D: e.target.checked })}
                    className="rounded text-green-600"
                  />
                  <label htmlFor="is3D" className="ml-2 text-sm text-green-700 font-semibold">
                    Generate 3D braille dots
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="doubleSided"
                    checked={pdfOptions.doubleSided}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, doubleSided: e.target.checked })}
                    className="rounded text-green-600"
                  />
                  <label htmlFor="doubleSided" className="ml-2 text-sm text-green-700 font-semibold">
                    Double-sided printing
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-1">
                    Paper Size
                  </label>
                  <select
                    value={pdfOptions.paperSize}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, paperSize: e.target.value as 'letter' | 'a4' | 'legal' })}
                    className="w-full border-2 border-green-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="letter">Letter (8.5" x 11")</option>
                    <option value="a4">A4</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner />
              <span className="ml-2 text-green-700 font-semibold">Translating to braille...</span>
            </div>
          ) : brailleResult.length > 0 ? (
            <div>
              <div className="border-2 border-green-200 rounded-2xl p-6 bg-green-50 shadow-lg">
                <div className="overflow-x-auto">
                  <div className="flex flex-wrap gap-8 p-4 justify-center">
                    {brailleResult.map((wordCells, wordIndex) => (
                      <div key={wordIndex} className="flex flex-col items-center">
                        <BrailleWord
                          cells={wordCells}
                          size="md"
                          word={recognizedText.split(' ')[wordIndex] || ''}
                          showText={true}
                          triggerSolenoids={wordIndex === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-green-700 font-semibold">
                  {brailleResult.reduce((total, word) => total + word.length, 0)} braille cells generated
                  {isArduinoConnected && brailleResult.length > 0 && (
                    <span className="block text-blue-600 mt-1">
                      Arduino: Displaying first letter "{brailleResult[0][0]?.char}"
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <span>🧩</span> 3D Preview
                </h3>
                <BrailleModelViewer 
                  cells={brailleResult}
                  dotHeight={pdfOptions.dotHeight}
                  dotDiameter={pdfOptions.dotDiameter}
                  baseThickness={pdfOptions.baseThickness}
                />
                <p className="mt-2 text-sm text-green-700 text-center font-semibold">
                  Click and drag to rotate. Scroll to zoom.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-green-700 font-semibold">
              {recognizedText ? 
                'Click Translate to convert your text to braille' : 
                'Speak or type text to see the braille representation'
              }
            </div>
          )}
          
          {isArduinoConnected && brailleResult.length > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-green-700 text-sm">
                First letter sent to your connected Arduino device
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechToBraillePage;