import React, { useState, useEffect } from 'react';
import { Download, Copy, RefreshCcw, Settings, FileDown as FileDown3D } from 'lucide-react';
import SpeechRecognition from '../components/speech/SpeechRecognition';
import BrailleWord from '../components/braille/BrailleWord';
import BrailleModelViewer from '../components/braille/BrailleModelViewer';
import { useAppContext } from '../context/AppContext';
import { SpeechRecognitionResult, BrailleCell } from '../types/types';
import { translateTextToBraille } from '../services/brailleTranslator';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { generateBraillePdf, downloadPdf } from '../services/pdfGenerator';

const SpeechToBraillePage: React.FC = () => {
  const { isArduinoConnected, sendBraillePattern } = useAppContext();
  const [recognizedText, setRecognizedText] = useState('');
  const [isFinalResult, setIsFinalResult] = useState(false);
  const [brailleResult, setBrailleResult] = useState<BrailleCell[][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPdfSettings, setShowPdfSettings] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    title: 'Braille Document',
    includeText: true,
    doubleSided: false,
    paperSize: 'letter' as const,
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

  const translateSpeechToBraille = async (text: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const brailleCells = await translateTextToBraille(text);
      setBrailleResult(brailleCells);
      
      // Send to Arduino if connected (send first word's first letter for demo)
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
    <div className="min-h-screen bg-gray-50 braille-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white py-12 relative">
        <div className="absolute inset-0 braille-bg opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl font-bold leading-tight mb-4">
            Speech to Braille Converter
          </h1>
          <p className="text-lg text-primary-100">
            Speak into your microphone to convert speech to braille or send to your Arduino device
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-900 p-6 mb-8 mt-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Speak or Type
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 flex flex-col items-center justify-center">
              <SpeechRecognition
                onResult={handleSpeechResult}
                onError={(errorMsg) => setError(errorMsg)}
                stopAfterResult={false}
                continuous={true}
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="manual-text" className="block text-sm font-medium text-gray-700 mb-1">
                Or type text manually:
              </label>
              <textarea
                id="manual-text"
                value={recognizedText}
                onChange={(e) => setRecognizedText(e.target.value)}
                className="w-full h-32 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type text to convert to braille..."
              ></textarea>
              
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1 bg-gray-200 rounded-md text-gray-700 text-sm hover:bg-gray-300"
                >
                  Clear
                </button>
                <button
                  onClick={handleManualTranslate}
                  className="px-3 py-1 bg-blue-600 rounded-md text-white text-sm hover:bg-blue-700"
                  disabled={!recognizedText.trim()}
                >
                  Translate
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-900 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Braille Output
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPdfSettings(!showPdfSettings)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title="PDF Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={handleCopyBraille}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
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
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
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
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                title="Download 3D Model"
                disabled={brailleResult.length === 0}
              >
                <FileDown3D size={18} />
              </button>
            </div>
          </div>

          {showPdfSettings && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-900 shadow-md">
              <h3 className="font-medium text-gray-900 mb-3">PDF Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={pdfOptions.title}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeText"
                    checked={pdfOptions.includeText}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, includeText: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="includeText" className="ml-2 text-sm text-gray-700">
                    Include text alongside braille
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is3D"
                    checked={pdfOptions.is3D}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, is3D: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="is3D" className="ml-2 text-sm text-gray-700">
                    Generate 3D braille dots
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="doubleSided"
                    checked={pdfOptions.doubleSided}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, doubleSided: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="doubleSided" className="ml-2 text-sm text-gray-700">
                    Double-sided printing
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paper Size
                  </label>
                  <select
                    value={pdfOptions.paperSize}
                    onChange={(e) => setPdfOptions({ ...pdfOptions, paperSize: e.target.value as 'letter' | 'a4' | 'legal' })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <span className="ml-2 text-gray-600">Translating to braille...</span>
            </div>
          ) : brailleResult.length > 0 ? (
            <div>
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <div className="overflow-x-auto">
                  <div className="flex flex-wrap gap-8 p-4 justify-center">
                    {brailleResult.map((wordCells, wordIndex) => (
                      <div key={wordIndex} className="flex flex-col items-center">
                        <BrailleWord
                          cells={wordCells}
                          size="md"
                          word={recognizedText.split(' ')[wordIndex] || ''}
                          showText={true}
                          triggerSolenoids={wordIndex === 0} // Only first word triggers Arduino
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 text-center text-sm text-gray-500">
                  {brailleResult.reduce((total, word) => total + word.length, 0)} braille cells generated
                  {isArduinoConnected && brailleResult.length > 0 && (
                    <span className="block text-blue-600 mt-1">
                      Arduino: Displaying first letter "{brailleResult[0][0]?.char}"
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  3D Preview
                </h3>
                <BrailleModelViewer 
                  cells={brailleResult}
                  dotHeight={pdfOptions.dotHeight}
                  dotDiameter={pdfOptions.dotDiameter}
                  baseThickness={pdfOptions.baseThickness}
                />
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Click and drag to rotate. Scroll to zoom.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
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