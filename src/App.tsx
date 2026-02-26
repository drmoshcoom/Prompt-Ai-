import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Copy, 
  Save, 
  Share2, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon, 
  Type as TypeIcon,
  Layers,
  Settings,
  Heart,
  ChevronRight,
  Search,
  Check,
  AlertCircle,
  Wand2,
  Camera,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { STYLES, ASPECT_RATIOS, RESOLUTIONS, PromptStyle } from './constants';
import { 
  refinePrompt, 
  suggestKeywords, 
  analyzeImageForPrompt, 
  generateVisualPreview,
  getComplexPromptAdvice
} from './services/geminiService';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<PromptStyle | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [resolution, setResolution] = useState('1024x1024');
  const [isRefining, setIsRefining] = useState(false);
  const [suggestedKeywordsList, setSuggestedKeywordsList] = useState<string[]>([]);
  const [visualPreview, setVisualPreview] = useState('');
  const [favorites, setFavorites] = useState<{id: string, text: string, style?: string}[]>([]);
  const [showToast, setShowToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [adviceQuery, setAdviceQuery] = useState('');
  const [adviceResponse, setAdviceResponse] = useState('');
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load favorites from local storage
  useEffect(() => {
    const saved = localStorage.getItem('promptcraft_favorites');
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const saveToLocalStorage = (newFavorites: typeof favorites) => {
    localStorage.setItem('promptcraft_favorites', JSON.stringify(newFavorites));
  };

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleGetAdvice = async () => {
    if (!adviceQuery.trim()) return;
    setIsGettingAdvice(true);
    try {
      const advice = await getComplexPromptAdvice(adviceQuery);
      setAdviceResponse(advice);
    } catch (error) {
      notify('Failed to get advice', 'error');
    } finally {
      setIsGettingAdvice(false);
    }
  };

  const handleRefine = async () => {
    if (!prompt.trim()) return;
    setIsRefining(true);
    try {
      const refined = await refinePrompt(prompt, selectedStyle?.name);
      setPrompt(refined);
      const keywords = await suggestKeywords(refined);
      setSuggestedKeywordsList(keywords);
      const preview = await generateVisualPreview(refined);
      setVisualPreview(preview);
      notify('Prompt refined successfully!');
    } catch (error) {
      notify('Failed to refine prompt', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const handleAddKeyword = (keyword: string) => {
    if (!prompt.includes(keyword)) {
      setPrompt(prev => prev.trim() + (prev ? ', ' : '') + keyword);
    }
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    notify('تم نسخ البرومبت إلى الحافظة!');
  };

  const handleSave = () => {
    if (!prompt.trim()) return;
    const newFav = { id: Date.now().toString(), text: prompt, style: selectedStyle?.name };
    const updated = [newFav, ...favorites];
    setFavorites(updated);
    saveToLocalStorage(updated);
    notify('Prompt saved to favorites!');
  };

  const handleDeleteFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    saveToLocalStorage(updated);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const analyzedPrompt = await analyzeImageForPrompt(base64);
        setPrompt(analyzedPrompt);
        notify('Image analyzed and prompt generated!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      notify('Failed to analyze image', 'error');
    } finally {
      setIsAnalyzingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-3",
              showToast.type === 'success' ? "bg-slate-900 text-white" : "bg-red-500 text-white"
            )}
          >
            {showToast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{showToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-bottom border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">برومبت كرافت <span className="text-indigo-600">AI</span></h1>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="text-slate-900">المحرر</a>
            <a href="#" className="hover:text-slate-900 transition-colors">المكتبة</a>
            <a href="#" className="hover:text-slate-900 transition-colors">المجتمع</a>
          </nav>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAdviceModal(true)}
              className="p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
              title="نصائح البرومبت"
            >
              <Sparkles size={20} />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors relative group"
              title="تحليل صورة"
            >
              <Camera size={20} />
              {isAnalyzingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                  <RefreshCw size={14} className="animate-spin text-indigo-600" />
                </div>
              )}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <button className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
              تسجيل الدخول
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Editor & Styles */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Main Editor */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <TypeIcon size={18} />
                  <h2 className="text-sm font-semibold uppercase tracking-wider">محرر البرومبت</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPrompt('')}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="مسح"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="صف رؤيتك الإبداعية هنا... مثال: 'حديقة مستقبلية في قبة زجاجية على المريخ، نباتات مضيئة حيوياً، إضاءة سينمائية'"
                  className="w-full h-48 p-0 text-xl md:text-2xl font-medium text-slate-800 placeholder:text-slate-300 border-none focus:ring-0 resize-none text-right"
                />
                
                <div className="flex flex-wrap gap-2 mt-4 justify-end">
                  {suggestedKeywordsList.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddKeyword(kw)}
                      className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full hover:bg-slate-200 transition-colors"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleRefine}
                    disabled={isRefining || !prompt.trim()}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-100"
                  >
                    {isRefining ? <RefreshCw size={18} className="animate-spin" /> : <Wand2 size={18} />}
                    تحسين بالذكاء الاصطناعي
                  </button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleSave}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                  >
                    <Save size={18} />
                    حفظ
                  </button>
                  <button 
                    onClick={() => handleCopy(prompt)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all"
                  >
                    <Copy size={18} />
                    نسخ
                  </button>
                </div>
              </div>
            </section>

            {/* Style Library */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-500 px-2">
                <Layers size={18} />
                <h2 className="text-sm font-semibold uppercase tracking-wider">مكتبة الأنماط</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(selectedStyle?.id === style.id ? null : style)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl p-4 text-left transition-all border-2 flex items-center gap-3",
                      selectedStyle?.id === style.id 
                        ? "border-indigo-600 bg-indigo-50/50" 
                        : "border-transparent bg-white hover:border-slate-200"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-lg", style.previewColor)}>
                      <style.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{style.name}</h3>
                      <p className="text-[10px] text-slate-500 leading-tight mt-1">{style.description}</p>
                    </div>
                    {selectedStyle?.id === style.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Settings & Preview */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Visual Preview */}
            <section className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ImageIcon size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <ImageIcon size={16} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider">معاينة بصرية</h2>
                </div>
                {visualPreview ? (
                  <textarea
                    value={visualPreview}
                    readOnly
                    className="w-full h-auto p-0 text-slate-300 text-sm leading-relaxed italic text-right bg-transparent border-none focus:ring-0 resize-none"
                    rows={4}
                  />
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 text-sm">قم بتحسين البرومبت الخاص بك لرؤية وصف مرئي لفكرتك.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Configuration */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 mb-6">
                <Settings size={18} />
                <h2 className="text-sm font-semibold uppercase tracking-wider">إعدادات الإخراج</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">نسبة العرض إلى الارتفاع</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={cn(
                          "py-2 px-1 text-[10px] font-bold rounded-lg border transition-all",
                          aspectRatio === ratio.value 
                            ? "bg-indigo-600 border-indigo-600 text-white" 
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        )}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">الدقة</label>
                  <div className="space-y-2">
                    {RESOLUTIONS.map((res) => (
                      <button
                        key={res.value}
                        onClick={() => setResolution(res.value)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                          resolution === res.value 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
                        )}
                      >
                        <span className="text-sm font-semibold">{res.label}</span>
                        <span className="text-xs opacity-60">{res.value}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Favorites */}
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-500">
                  <Heart size={18} />
                  <h2 className="text-sm font-semibold uppercase tracking-wider">المفضلة</h2>
                </div>
                <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{favorites.length}</span>
              </div>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {favorites.length > 0 ? (
                  favorites.map((fav) => (
                    <div 
                      key={fav.id} 
                      className="group p-4 bg-slate-50 rounded-2xl relative hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => setPrompt(fav.text)}
                    >
                      <p className="text-xs text-slate-700 line-clamp-3 pr-6 leading-relaxed">
                        {fav.text}
                      </p>
                      {fav.style && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-white text-[9px] font-bold text-slate-400 rounded uppercase tracking-wider">
                          {fav.style}
                        </span>
                      )}
                      <div className="absolute top-3 left-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(fav.text);
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600"
                          title="نسخ"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFavorite(fav.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500"
                          title="حذف"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400">لا توجد برومبتات محفوظة بعد.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles size={16} />
            <span className="text-sm font-medium">مصمم للمبدعين بواسطة برومبت كرافت AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-slate-900 transition-colors">الخصوصية</a>
            <a href="#" className="hover:text-slate-900 transition-colors">الشروط</a>
            <a href="#" className="hover:text-slate-900 transition-colors">واجهة برمجة التطبيقات</a>
            <a href="#" className="hover:text-slate-900 transition-colors">الدعم الفني</a>
          </div>
        </div>
      </footer>

      {/* Advice Modal */}
      <AnimatePresence>
        {showAdviceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdviceModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} />
                  <h2 className="text-lg font-bold">نصائح البرومبت الخبيرة</h2>
                </div>
                <button onClick={() => setShowAdviceModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">اطرح سؤالاً معقداً</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={adviceQuery}
                      onChange={(e) => setAdviceQuery(e.target.value)}
                      placeholder="مثال: كيف يمكنني الحصول على مظهر 'ناشيونال جيوغرافيك' للحياة البرية؟"
                      className="flex-1 bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-right"
                      onKeyDown={(e) => e.key === 'Enter' && handleGetAdvice()}
                    />
                    <button 
                      onClick={handleGetAdvice}
                      disabled={isGettingAdvice || !adviceQuery.trim()}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all"
                    >
                      {isGettingAdvice ? <RefreshCw size={18} className="animate-spin" /> : <ChevronRight size={18} className="transform rotate-180" />}
                    </button>
                  </div>
                </div>

                {adviceResponse && (
                  <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-3">
                      <Wand2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">استجابة خبير الذكاء الاصطناعي</span>
                    </div>
                    <div className="prose prose-sm text-slate-700 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-right">
                      {adviceResponse}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">مدعوم بواسطة Gemini 3.1 Pro وضع التفكير</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
