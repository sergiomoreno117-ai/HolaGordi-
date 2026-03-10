import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScannerProps {
  onScan: (barcode: string) => void;
  isScanning: boolean;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, isScanning }) => {
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>("");

  useEffect(() => {
    const startScanner = async () => {
      try {
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
        ];

        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode("reader", { formatsToSupport, verbose: false });
        }

        const config = {
          fps: 20,
          qrbox: { width: 280, height: 180 },
          aspectRatio: 1.0,
        };

        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (decodedText !== lastScannedRef.current) {
              lastScannedRef.current = decodedText;
              onScan(decodedText);
              setTimeout(() => { lastScannedRef.current = ""; }, 3000);
            }
          },
          () => {}
        );
        setPermissionStatus('granted');
        setError(null);
      } catch (err: any) {
        console.error("Error starting scanner:", err);
        if (err.toString().includes("NotAllowedError")) {
          setPermissionStatus('denied');
          setError("Permiso de cámara denegado.");
        } else {
          setError("Error al iniciar la cámara.");
        }
      }
    };

    const stopScanner = async () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
    };

    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning, onScan]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square overflow-hidden glass-card bg-emerald-50/40">
      <div id="reader" className="w-full h-full object-cover"></div>
      
      <AnimatePresence>
        {!isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900 text-emerald-50 p-10 text-center z-10"
          >
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black mb-2 tracking-tighter uppercase">Cámara Lista</h3>
            <p className="font-bold text-[10px] uppercase tracking-[0.2em] opacity-50">
              Pulsa SCAN para empezar
            </p>
          </motion.div>
        )}

        {permissionStatus === 'denied' && isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-red-500 text-white p-10 text-center z-50"
          >
            <AlertCircle className="w-16 h-16 mb-6" />
            <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter">¡ERROR DE PERMISOS!</h3>
            <p className="text-sm font-bold mb-8 uppercase tracking-tight">
              Necesitamos acceso a tu cámara.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-red-500 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </motion.div>
        )}

        {isScanning && permissionStatus === 'granted' && !error && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[180px] border-2 border-emerald-500/50 rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.4)]">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl"></div>
              
              <motion.div 
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#34d399] z-10"
              />
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-md text-emerald-400 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] text-[9px] border border-white/10">
              Escaneando...
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
