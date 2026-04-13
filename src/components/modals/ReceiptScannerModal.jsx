import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Loader2, CheckCircle, AlertCircle, ScanLine } from 'lucide-react';

export default function ReceiptScannerModal({ isOpen, onClose, onDetected }) {
  const [status, setStatus]     = useState('idle'); // idle | scanning | done | error
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef();

  if (!isOpen) return null;

  const handleClose = () => {
    setStatus('idle');
    setPreview(null);
    setResult(null);
    setErrorMsg('');
    onClose();
  };

    const parseReceiptText = (text) => {
    // Curăţăm textul de caractere ciudate OCR și spații multiple
    const cleanText = text.replace(/\s+/g, ' ');

    // ─── Extrage suma totală ────────────────────────────────────────────────
    // Caută pattern-uri ca: TOTAL LEI 1 204.05, TOTAL: 47.50, sau doar suma urmată de LEI
    const totalPatterns = [
      /total\s+lei\s+([\d\s]+[.,]\d{2})/i,
      /total[:\s]+([\d\s]+[.,]\d{2})/i,
      /([\d\s]+[.,]\d{2})\s*(mdl|lei|l)/i,
    ];
    
    let amount = null;
    for (const pattern of totalPatterns) {
      const m = text.match(pattern);
      if (m) {
        // Luăm cifra, scoatem spațiile (separatori mii) și înlocuim vigula cu punct
        const rawAmount = m[1].replace(/\s/g, '').replace(',', '.');
        amount = parseFloat(rawAmount);
        break;
      }
    }

    // ─── Detectează categoria pe baza cuvintelor cheie ─────────────────────
    const lower = text.toLowerCase();
    let category = 'other';
    if (/kaufland|penny|lidl|mega|auchan|supermarket|market|billa|carrefour|profi/.test(lower)) category = 'food';
    else if (/restaurant|pizz|mc|kfc|burger|kebab|meniu|sushi|grill|bistro/.test(lower)) category = 'food';
    else if (/farmaci|familie|dita|sanitas|medicover|medic|clinic|spital|reteta/.test(lower)) category = 'health';
    else if (/carburant|petrom|mol|rompetrol|benzin|motorina/.test(lower)) category = 'transport';
    else if (/h&m|zara|pull|new yorker|haine|imbracaminte/.test(lower)) category = 'clothing';
    else if (/starbucks|caffe|coffee|costa|espresso/.test(lower)) category = 'coffee';
    else if (/emag|altex|mediagalaxy|dedeman|bricostore/.test(lower)) category = 'shopping';
    else if (/orange|vodafone|digi|telekom/.test(lower)) category = 'phone';

    // ─── Extrage data ───────────────────────────────────────────────────────
    const datePatterns = [
      /(\d{2})[./-](\d{2})[./-](\d{4})/,
      /(\d{4})[./-](\d{2})[./-](\d{2})/,
    ];
    let date = new Date().toISOString().split('T')[0];
    for (const p of datePatterns) {
      const m = text.match(p);
      if (m) {
        const parts = m[0].split(/[./-]/);
        if (parts[0].length === 4) date = `${parts[0]}-${parts[1]}-${parts[2]}`;
        else date = `${parts[2]}-${parts[1]}-${parts[0]}`;
        break;
      }
    }

    return { amount, category, date };
  };

  const processImage = async (file) => {
    if (!file) return;

    // Preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus('scanning');

    try {
      // Tesseract.js — dynamic import pentru a nu mări bundle-ul inițial
      const Tesseract = await import('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(file, 'ron+eng', {
        logger: () => {}, // suprimă log-urile verbose
      });

      const parsed = parseReceiptText(text);
      setResult({ ...parsed, rawText: text });

      if (parsed.amount) {
        setStatus('done');
      } else {
        setStatus('error');
        setErrorMsg('Nu am putut detecta suma. Poți introduce manual.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg('Eroare la procesarea imaginii: ' + err.message);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
  };

  const handleUseResult = () => {
    if (!result) return;
    onDetected({
      amount: result.amount ? String(result.amount) : '',
      category: result.category,
      date: result.date,
      type: 'expense',
      description: 'Scanat din bon',
    });
    handleClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-transparent dark:border-slate-700 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl">
                <ScanLine size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 dark:text-white">Scanează Bon</h3>
                <p className="text-xs text-gray-400">OCR automat — suma detectată instant</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Preview imagine */}
            {preview && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 max-h-48">
                <img src={preview} alt="bon" className="w-full h-48 object-cover" />
                {status === 'scanning' && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                    <div className="w-full max-w-xs h-0.5 bg-purple-400/40 relative overflow-hidden rounded-full">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-purple-400"
                        animate={{ x: ['0%', '100%', '0%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ width: '40%' }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <Loader2 size={16} className="animate-spin" />
                      Procesez imaginea...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rezultat */}
            {status === 'done' && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/40"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="font-bold text-green-700 dark:text-green-400 text-sm">Bon detectat cu succes!</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Suma:</span>
                    <span className="font-black text-gray-800 dark:text-white text-lg">{result.amount} MDL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Categorie detectată:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{result.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Data:</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{result.date}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/40 flex items-start gap-2">
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
              </div>
            )}

            {/* Butoane upload/camera */}
            {status === 'idle' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { fileRef.current.accept='image/*'; fileRef.current.capture='environment'; fileRef.current.click(); }}
                  className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-purple-200 dark:border-purple-800/50 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                >
                  <Camera size={28} />
                  <span className="text-sm font-semibold">Cameră</span>
                </button>
                <button
                  onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click(); }}
                  className="flex flex-col items-center gap-2 p-5 border-2 border-dashed border-blue-200 dark:border-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                >
                  <Upload size={28} />
                  <span className="text-sm font-semibold">Galerie</span>
                </button>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* Butoane acțiune */}
            <div className="flex gap-3">
              {(status === 'done' || status === 'error') && (
                <button
                  onClick={() => { setStatus('idle'); setPreview(null); setResult(null); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition text-sm"
                >
                  Încearcă din nou
                </button>
              )}
              {status === 'done' && result?.amount && (
                <button
                  onClick={handleUseResult}
                  className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition text-sm"
                >
                  Folosește suma →
                </button>
              )}
              {status === 'error' && (
                <button
                  onClick={handleUseResult}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-sm"
                >
                  Introdu manual →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
