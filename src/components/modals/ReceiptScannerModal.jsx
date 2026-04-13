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
    // 1. Text pentru categorii (păstrăm originalul)
    const lower = text.toLowerCase();

    // 2. Text pentru cifre (normalizăm spații și erori comune OCR)
    const numericContext = text
      .replace(/(\d)\s+(\d)/g, '$1$2')             // 1 204 -> 1204
      .replace(/(\d)\s+([.,])\s+(\d)/g, '$1$2$3')  // 1 . 05 -> 1.05
      .replace(/,(\d{2})\b/g, '.$1');              // viraula la final de bani devine punct

    // 3. Extragem toate numerele de tip XX.XX sau XX,XX
    const allAmounts = [];
    const amountMatches = numericContext.matchAll(/(\d+[.,]\d{2})/g);
    for (const m of amountMatches) {
      const val = parseFloat(m[1].replace(',', '.'));
      if (!isNaN(val) && val > 0) allAmounts.push(val);
    }

    // 4. Căutăm cuvântul TOTAL sau echivalent
    // Verificăm și variantele greșite de OCR: T0TAL, TQTAL, T0TA1
    const totalRegex = /t[o0q]ta[l1]|lei|mdl|numerar|suma|plata/i;
    let amount = null;

    const lines = numericContext.split('\n');
    for (const line of lines) {
      if (totalRegex.test(line)) {
        const m = line.match(/(\d+[.,]\d{2})/);
        if (m) {
          amount = parseFloat(m[1].replace(',', '.'));
          break;
        }
      }
    }

    // Fallback: Dacă nu am găsit prin cuvânt cheie, luăm cea mai mare sumă (de obicei Totalul e MAX)
    if (!amount && allAmounts.length > 0) {
      amount = Math.max(...allAmounts);
    }

    // 5. Detectează categoria
    let category = 'other';
    if (/kaufland|penny|lidl|mega|auchan|supermarket|market|billa|carrefour|profi/.test(lower)) category = 'food';
    else if (/restaurant|pizz|mc|kfc|burger|kebab|meniu|sushi|grill|bistro/.test(lower)) category = 'food';
    else if (/farmaci|familie|dita|sanitas|medicover|medic|clinic|spital|reteta/.test(lower)) category = 'health';
    else if (/carburant|petrom|mol|rompetrol|benzin|motorina/.test(lower)) category = 'transport';
    else if (/h&m|zara|pull|new yorker|haine|imbracaminte/.test(lower)) category = 'clothing';
    else if (/starbucks|caffe|coffee|costa|espresso/.test(lower)) category = 'coffee';
    else if (/emag|altex|mediagalaxy|dedeman|bricostore/.test(lower)) category = 'shopping';
    else if (/orange|vodafone|digi|telekom/.test(lower)) category = 'phone';

    // 6. Extrage data
    const dateM = numericContext.match(/(\d{2})[./-](\d{2})[./-](\d{4})/) || numericContext.match(/(\d{4})[./-](\d{2})[./-](\d{2})/);
    let date = new Date().toISOString().split('T')[0];
    if (dateM) {
        const parts = dateM[0].split(/[./-]/);
        if (parts[0].length === 4) date = `${parts[0]}-${parts[1]}-${parts[2]}`;
        else date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return { amount, category, date, rawText: text };
  };

  const processImage = async (file) => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus('scanning');
    setErrorMsg('');

    try {
      const Tesseract = await import('tesseract.js');
      // Folosim ron (Romanian) pentru acuratețe optimă pe bonurile din MD
      const { data: { text } } = await Tesseract.recognize(file, 'ron', {
        logger: () => {},// m => console.log(m)
      });

      const parsed = parseReceiptText(text);
      setResult(parsed);

      if (parsed.amount) {
        setStatus('done');
      } else {
        setStatus('error');
        setErrorMsg('Nu am putut detecta suma automant. Verifică textul sau introdu-o manual.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Ups! Eroare la procesare. Poți încerca altă poză.');
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
                <h3 className="font-bold text-gray-800 dark:text-white">Scaner Bonuri</h3>
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Acuratețe MDL 🇲🇩</p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition">
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Imagine Preview */}
            {preview && (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 max-h-48 group">
                <img src={preview} alt="bon" className="w-full h-48 object-cover" />
                {status === 'scanning' && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                    <Loader2 size={32} className="animate-spin text-purple-400" />
                    <div className="text-white text-xs font-bold uppercase tracking-widest">Se procesează...</div>
                  </div>
                )}
              </div>
            )}

            {/* Rezultat Succes */}
            {status === 'done' && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/40"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  <span className="font-bold text-green-700 dark:text-green-400 text-sm">Bon citit!</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-green-100/50 dark:border-green-800/20 pb-2">
                    <span className="text-xs text-gray-500">Suma Detectată:</span>
                    <span className="font-black text-gray-800 dark:text-white text-xl">{result.amount} MDL</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Data:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{result.date}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Eroare / Debug */}
            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/40 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-500 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errorMsg}</p>
                </div>
                {result?.rawText && (
                  <details className="bg-white/40 dark:bg-black/20 rounded-lg overflow-hidden">
                    <summary className="p-2 text-[10px] text-red-500 cursor-pointer font-bold hover:bg-white/60">DESCHIDE TEXT DETECTAT (DEBUG)</summary>
                    <div className="p-3 text-[9px] font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-32 overflow-y-auto border-t border-red-100 dark:border-red-900/30">
                      {result.rawText}
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Interfață Încărcare */}
            {status === 'idle' && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { fileRef.current.accept='image/*'; fileRef.current.capture='environment'; fileRef.current.click(); }}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-purple-200 dark:border-purple-800/30 rounded-2xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all active:scale-95"
                >
                  <Camera size={32} />
                  <span className="text-xs font-bold uppercase tracking-wide">Cameră</span>
                </button>
                <button
                  onClick={() => { fileRef.current.removeAttribute('capture'); fileRef.current.click(); }}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-blue-200 dark:border-blue-800/30 rounded-2xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95"
                >
                  <Upload size={32} />
                  <span className="text-xs font-bold uppercase tracking-wide">Galerie</span>
                </button>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {/* Butoane Acțiune Finală */}
            <div className="flex gap-3 pt-2">
              {(status === 'done' || status === 'error') && (
                <button
                  onClick={() => { setStatus('idle'); setPreview(null); setResult(null); }}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition text-sm"
                >
                  Rereîncearcă
                </button>
              )}
              {status === 'done' && (
                <button
                  onClick={handleUseResult}
                  className="flex-3 py-3 rounded-xl bg-purple-600 text-white font-black hover:bg-purple-700 transition text-sm shadow-lg shadow-purple-500/20"
                >
                  FOLOSEȘTE DATELE →
                </button>
              )}
              {status === 'error' && (
                <button
                  onClick={handleUseResult}
                  className="flex-3 py-3 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 transition text-sm"
                >
                  INTRODUC MANUUAL →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
