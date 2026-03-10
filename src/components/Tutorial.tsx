import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scan, LayoutDashboard, ShoppingCart, MessageSquare, ChevronRight, X, CheckCircle2 } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "¡Bienvenido a HolaGordi!",
    description: "Tu compañero inteligente para una vida más saludable. Vamos a darte un pequeño tour por las funciones principales.",
    icon: <CheckCircle2 className="w-12 h-12 text-emerald-500" />,
    color: "bg-emerald-50"
  },
  {
    title: "Escáner Inteligente",
    description: "Usa la cámara para escanear cualquier producto. Analizaremos sus macros y te diremos si es una buena opción para ti.",
    icon: <Scan className="w-12 h-12 text-blue-500" />,
    color: "bg-blue-50"
  },
  {
    title: "Panel de Control",
    description: "Sigue tus pasos, hidratación y consumo diario en tiempo real. Mantén tus objetivos bajo control.",
    icon: <LayoutDashboard className="w-12 h-12 text-purple-500" />,
    color: "bg-purple-50"
  },
  {
    title: "Lista de la Compra",
    description: "Genera listas inteligentes basadas en tus necesidades y busca productos en tus supermercados favoritos.",
    icon: <ShoppingCart className="w-12 h-12 text-orange-500" />,
    color: "bg-orange-50"
  },
  {
    title: "Coach IA",
    description: "Chatea con nuestra IA para resolver dudas nutricionales o pedir rutinas de entrenamiento personalizadas.",
    icon: <MessageSquare className="w-12 h-12 text-pink-500" />,
    color: "bg-pink-50"
  }
];

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20"
      >
        <div className="relative p-8 flex flex-col items-center text-center">
          <button 
            onClick={onComplete}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center"
            >
              <div className={`w-24 h-24 ${steps[currentStep].color} dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-8 shadow-inner`}>
                {steps[currentStep].icon}
              </div>

              <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
                {steps[currentStep].title}
              </h2>
              
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10">
                {steps[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="w-full flex items-center justify-between mt-auto">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-8 bg-emerald-500' : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={nextStep}
              className="primary-btn flex items-center gap-2 group"
            >
              <span className="text-sm">
                {currentStep === steps.length - 1 ? 'Empezar' : 'Siguiente'}
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
