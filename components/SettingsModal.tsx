import React from 'react';
import { AppSettings, TranslationStyle, AiModel } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);

  const handleStyleChange = (style: TranslationStyle) => {
    setLocalSettings(prev => ({ ...prev, translationStyle: style }));
  };

  const handleModelChange = (model: AiModel) => {
    setLocalSettings(prev => ({ ...prev, summaryModel: model }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-[fadeIn_0.2s_ease-out] transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preferences</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Translation Style Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Translation Style</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'tech', label: 'Tech-Focused', desc: 'Keeps technical terms intact' },
                { id: 'concise', label: 'Concise', desc: 'Short and direct' },
                { id: 'professional', label: 'Professional', desc: 'Formal business tone' },
                { id: 'fun', label: 'Fun / Social', desc: 'Casual and engaging' },
              ].map((option) => (
                <div 
                  key={option.id}
                  onClick={() => handleStyleChange(option.id as TranslationStyle)}
                  className={`cursor-pointer border rounded-lg p-3 transition-all ${
                    localSettings.translationStyle === option.id 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                  }`}
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Model Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Summary AI Engine</label>
            <div className="space-y-3">
              <div 
                onClick={() => handleModelChange('gemini-2.5-flash')}
                className={`cursor-pointer border rounded-lg p-4 flex items-start gap-3 transition-all ${
                  localSettings.summaryModel === 'gemini-2.5-flash'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    localSettings.summaryModel === 'gemini-2.5-flash' ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                    {localSettings.summaryModel === 'gemini-2.5-flash' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">Gemini 2.5 Flash <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full ml-2">Fast</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quick summaries. Good for general understanding.</div>
                </div>
              </div>

              <div 
                onClick={() => handleModelChange('gemini-3-pro-preview')}
                className={`cursor-pointer border rounded-lg p-4 flex items-start gap-3 transition-all ${
                  localSettings.summaryModel === 'gemini-3-pro-preview'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700'
                }`}
              >
                 <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    localSettings.summaryModel === 'gemini-3-pro-preview' ? 'border-orange-500' : 'border-gray-300 dark:border-gray-600'
                }`}>
                    {localSettings.summaryModel === 'gemini-3-pro-preview' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                </div>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">Gemini 3.0 Pro <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full ml-2">Advanced</span></div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Higher reasoning capability for deeper analysis. Slower response time.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-md shadow-sm transition-colors">Apply Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;