import { useState, useCallback, useRef, ChangeEvent, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Scanner } from './components/Scanner';
import { ProductCard } from './components/ProductCard';
import { Scan, History, Loader2, X, ChevronRight, Image as ImageIcon, Droplets, Zap, Footprints, LayoutDashboard, Trash2, ShoppingCart, MessageSquare, Dumbbell, Send, User, CheckCircle2, Quote, Search, Activity, Mic, MicOff, Star, MapPin, Navigation, Play, Square, Camera, Store, LogOut, Shield, Key, Mail, UserPlus, LogIn, RefreshCw, Moon, Sun, Info, ChevronLeft, Camera as CameraIcon, Check, FileText, Paperclip, BarChart3, Flame } from 'lucide-react';
import { cn } from './lib/utils';
import { Html5Qrcode } from 'html5-qrcode';
import { getProductByBarcode, ProductInfo, getChatResponse, generateWorkoutRoutine, UserProfile, ChatMessage, WorkoutRoutine, generateShoppingList, searchProducts, ShoppingItem, searchSupermarketProducts, analyzeFoodImage } from './services/gemini';

const Logo = ({ className }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
    <svg viewBox="0 0 100 100" className="w-full h-full relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Panda Head */}
      <circle cx="50" cy="55" r="35" fill="#f0fdf4" stroke="#18181b" strokeWidth="3"/>
      {/* Ears */}
      <circle cx="25" cy="30" r="12" fill="#18181b"/>
      <circle cx="75" cy="30" r="12" fill="#18181b"/>
      {/* Eye Patches */}
      <ellipse cx="38" cy="50" rx="10" ry="12" fill="#18181b" transform="rotate(-15 38 50)"/>
      <ellipse cx="62" cy="50" rx="10" ry="12" fill="#18181b" transform="rotate(15 62 50)"/>
      {/* Eyes */}
      <circle cx="40" cy="48" r="3" fill="white"/>
      <circle cx="60" cy="48" r="3" fill="white"/>
      {/* Nose */}
      <path d="M47 62 Q50 65 53 62" stroke="#18181b" strokeWidth="2" fill="none"/>
      {/* Broccoli */}
      <path d="M45 75 L55 75 L52 85 L48 85 Z" fill="#78350f"/>
      <circle cx="45" cy="72" r="8" fill="#059669"/>
      <circle cx="55" cy="72" r="8" fill="#059669"/>
      <circle cx="50" cy="65" r="10" fill="#10b981"/>
    </svg>
  </div>
);

const Tutorial = ({ onComplete, profile, onUpdateProfile }: { onComplete: () => void, profile: UserProfile, onUpdateProfile: (p: UserProfile) => void }) => {
  const [step, setStep] = useState(0);
  
  const requestPermissions = async () => {
    const newPermissions = { ...profile.permissions };
    
    try {
      // Camera
      await navigator.mediaDevices.getUserMedia({ video: true });
      newPermissions.camera = true;
    } catch (e) {
      console.log("Camera permission denied");
    }
    
    try {
      // GPS
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      newPermissions.gps = true;
    } catch (e) {
      console.log("GPS permission denied");
    }
    
    onUpdateProfile({ ...profile, permissions: newPermissions });
  };

  const steps = [
    {
      title: "¡Bienvenido a HolaGordi!",
      description: "Tu compañero inteligente para una vida más saludable. Escanea, registra y mejora día a día.",
      icon: <Logo className="w-24 h-24 mx-auto" />
    },
    {
      title: "Tu Coach con Superpoderes",
      description: "Nuestro Coach IA puede registrar comidas por ti, generar entrenamientos, analizar fotos de platos y hasta crear tu lista de la compra.",
      icon: <Zap className="w-16 h-16 text-emerald-500 mx-auto" />
    },
    {
      title: "Permisos del Dispositivo",
      description: "Para que el Coach pueda analizar tus platos y rastrear tus rutas, necesitamos acceso a la cámara y al GPS.",
      icon: <Shield className="w-16 h-16 text-blue-500 mx-auto" />,
      action: (
        <button 
          onClick={requestPermissions}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20"
        >
          Conceder Permisos
        </button>
      )
    },
    {
      title: "Todo Listo",
      description: "Recuerda que puedes volver a ver este tutorial desde tu perfil en cualquier momento.",
      icon: <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-emerald-50/90 backdrop-blur-xl flex items-center justify-center p-6"
    >
      <motion.div 
        key={step}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-emerald-50/95 rounded-[3rem] p-10 max-w-sm w-full text-center space-y-8 shadow-2xl border border-emerald-100"
      >
        <div className="py-4">{steps[step].icon}</div>
        <div className="space-y-3">
          <h3 className="text-3xl font-black tracking-tighter text-zinc-900">{steps[step].title}</h3>
          <p className="text-sm text-zinc-500 font-medium leading-relaxed">{steps[step].description}</p>
        </div>
        
        {steps[step].action && (
          <div className="pt-2">{steps[step].action}</div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 0 && (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-4 rounded-2xl font-black text-xs bg-zinc-100 text-zinc-400 uppercase tracking-widest"
            >
              Atrás
            </button>
          )}
          <button 
            onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onComplete()}
            className="flex-[2] py-4 rounded-2xl font-black text-xs bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 uppercase tracking-widest"
          >
            {step < steps.length - 1 ? "Siguiente" : "¡Empezar!"}
          </button>
        </div>
        <div className="flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={cn("w-2 h-2 rounded-full transition-all", i === step ? "bg-emerald-500 w-6" : "bg-zinc-100")} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

type Tab = 'dashboard' | 'scanner' | 'history' | 'shopping' | 'coach' | 'workout' | 'runners' | 'profile' | 'admin';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface ConsumedProduct extends ProductInfo {
  timestamp: number;
  amount: number;
}

const CircularProgress = ({ value, max, label, color, size = 80, strokeWidth = 8 }: { value: number, max: number, label: string, color: string, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-emerald-100/30 dark:text-zinc-800"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-black leading-none text-zinc-950">{Math.round(value)}</span>
          <span className="text-[8px] font-bold text-emerald-900/60 uppercase">/{max}</span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/60">{label}</span>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('hg_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formatCurrentDate = () => {
    const weekday = currentTime.toLocaleDateString('es-ES', { weekday: 'long' });
    const day = currentTime.toLocaleDateString('es-ES', { day: 'numeric' });
    const month = currentTime.toLocaleDateString('es-ES', { month: 'long' });
    const time = currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    return `${weekday} ${day} de ${month} a las ${time}`;
  };
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<ProductInfo | null>(null);
  const [history, setHistory] = useState<ProductInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingMsg, setLoadingMsg] = useState("Analizando...");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Daily Stats State
  const [steps, setSteps] = useState<number>(() => {
    const saved = localStorage.getItem('hg_steps');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [water, setWater] = useState<number>(() => {
    const saved = localStorage.getItem('hg_water');
    return saved ? parseFloat(saved) : 0;
  });
  const [creatine, setCreatine] = useState<boolean>(() => {
    const saved = localStorage.getItem('hg_creatine');
    return saved === 'true';
  });
  const [consumedProducts, setConsumedProducts] = useState<ConsumedProduct[]>(() => {
    const saved = localStorage.getItem('hg_consumed');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastResetDate, setLastResetDate] = useState<string>(() => {
    return localStorage.getItem('hg_last_reset') || new Date().toDateString();
  });

  // New Features State
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('hg_shopping_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [shoppingFavorites, setShoppingFavorites] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('hg_shopping_favs');
    return saved ? JSON.parse(saved) : [];
  });
  const [runnersDistance, setRunnersDistance] = useState<number>(() => {
    const saved = localStorage.getItem('hg_runners_dist');
    return saved ? parseFloat(saved) : 0;
  });
  const [isTrackingRun, setIsTrackingRun] = useState(false);
  const [runPath, setRunPath] = useState<{lat: number, lng: number}[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const [exerciseDone, setExerciseDone] = useState<boolean>(() => {
    const saved = localStorage.getItem('hg_exercise');
    return saved === 'true';
  });
  const [activityHistory, setActivityHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('hg_activity_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [trackingMode, setTrackingMode] = useState<'run' | 'walk'>('run');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('hg_dark');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hg_dark', darkMode.toString());
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const [showTutorial, setShowTutorial] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hg_profile');
    return saved ? JSON.parse(saved) : {
      displayName: '',
      avatarUrl: '',
      weight: 70,
      height: 170,
      age: 30,
      gender: 'male',
      goal: 'maintain',
      activityLevel: 'moderate',
      injuries: '',
      aiInstructions: '',
      hasSeenTutorial: false,
      stepGoal: 10000,
      waterGoal: 2,
      motivationalQuote: '¡Hoy es un gran día para ser mejor!',
      permissions: {
        camera: false,
        gps: false
      }
    };
  });

  useEffect(() => {
    if (user && userProfile && !userProfile.hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [user, userProfile]);
  const [completedExercises, setCompletedExercises] = useState<string[]>(() => {
    const saved = localStorage.getItem('hg_completed_exercises');
    return saved ? JSON.parse(saved) : [];
  });
  const [workoutRoutine, setWorkoutRoutine] = useState<WorkoutRoutine | null>(() => {
    const saved = localStorage.getItem('hg_workout');
    return saved ? JSON.parse(saved) : null;
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isWorkoutLoading, setIsWorkoutLoading] = useState(false);
  const [isShoppingLoading, setIsShoppingLoading] = useState(false);
  const [shoppingRequest, setShoppingRequest] = useState('');
  const [shoppingBudget, setShoppingBudget] = useState<number | ''>('');
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('Todos');
  const [shoppingSearch, setShoppingSearch] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch data on login
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setIsSyncing(true);
      try {
        const response = await fetch(`/api/user/${user.id}/data`);
        const data = await response.json();
        if (data.profile) {
          setUserProfile({
            displayName: data.profile.displayName || '',
            avatarUrl: data.profile.avatarUrl || '',
            weight: data.profile.weight || 70,
            height: data.profile.height || 170,
            age: data.profile.age || 30,
            gender: data.profile.gender || 'male',
            goal: data.profile.goal || 'maintain',
            activityLevel: data.profile.activityLevel || 'moderate',
            injuries: data.profile.injuries || '',
            aiInstructions: data.profile.aiInstructions || '',
            hasSeenTutorial: data.profile.hasSeenTutorial || false,
            stepGoal: data.profile.stepGoal || 10000,
            waterGoal: data.profile.waterGoal || 2,
            motivationalQuote: data.profile.motivationalQuote || '¡Hoy es un gran día para ser mejor!',
            permissions: data.profile.permissions || { camera: false, gps: false }
          });
        }
        if (data.stats) {
          setSteps(data.stats.steps);
          setWater(data.stats.water);
          setCreatine(!!data.stats.creatine);
          setExerciseDone(!!data.stats.exercise_done);
          setRunnersDistance(data.stats.runners_distance);
        }
        if (data.consumed) {
          setConsumedProducts(data.consumed);
        }
        if (data.shopping) {
          setShoppingList(data.shopping.filter((i: any) => !i.isFavorite));
          setShoppingFavorites(data.shopping.filter((i: any) => i.isFavorite));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsSyncing(false);
      }
    };
    fetchData();
  }, [user]);

  // Sync stats (debounced)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/user/${user.id}/stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ steps, water, creatine, exerciseDone, runnersDistance }),
        });
      } catch (err) {
        console.error("Error syncing stats:", err);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user, steps, water, creatine, exerciseDone, runnersDistance]);

  // Midnight Reset Logic
  useEffect(() => {
    const checkReset = () => {
      const today = new Date().toDateString();
      const lastReset = localStorage.getItem('hg_last_reset');
      
      if (lastReset !== today) {
        setSteps(0);
        setWater(0);
        setCreatine(false);
        setExerciseDone(false);
        setRunnersDistance(0);
        setConsumedProducts([]);
        setLastResetDate(today);
        localStorage.setItem('hg_last_reset', today);
        localStorage.setItem('hg_steps', '0');
        localStorage.setItem('hg_water', '0');
        localStorage.setItem('hg_creatine', 'false');
        localStorage.setItem('hg_exercise', 'false');
        localStorage.setItem('hg_runners_dist', '0');
        localStorage.setItem('hg_consumed', '[]');
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // Persist new features
  useEffect(() => {
    localStorage.setItem('hg_shopping_v2', JSON.stringify(shoppingList));
    localStorage.setItem('hg_shopping_favs', JSON.stringify(shoppingFavorites));
    localStorage.setItem('hg_runners_dist', runnersDistance.toString());
    localStorage.setItem('hg_exercise', exerciseDone.toString());
    localStorage.setItem('hg_profile', JSON.stringify(userProfile));
    localStorage.setItem('hg_workout', JSON.stringify(workoutRoutine));
  }, [shoppingList, shoppingFavorites, runnersDistance, exerciseDone, userProfile, workoutRoutine]);

  // Persist stats
  useEffect(() => {
    localStorage.setItem('hg_steps', steps.toString());
    localStorage.setItem('hg_water', water.toString());
    localStorage.setItem('hg_creatine', creatine.toString());
    localStorage.setItem('hg_consumed', JSON.stringify(consumedProducts));
  }, [steps, water, creatine, consumedProducts]);

  // Load history
  useEffect(() => {
    const savedHistory = localStorage.getItem('hg_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Persist history
  useEffect(() => {
    localStorage.setItem('hg_history', JSON.stringify(history));
  }, [history]);

  const dailyTotals = useMemo(() => {
    return consumedProducts.reduce((acc, curr) => {
      const ratio = curr.amount / 100;
      return {
        calories: acc.calories + (curr.caloriesPer100 * ratio),
        protein: acc.protein + (curr.proteinPer100 * ratio),
        carbs: acc.carbs + (curr.carbsPer100 * ratio),
        fat: acc.fat + (curr.fatPer100 * ratio),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [consumedProducts]);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (data.success) {
        if (authMode === 'login') {
          setUser(data.user);
          localStorage.setItem('hg_user', JSON.stringify(data.user));
        } else {
          setAuthMode('login');
          alert("¡Registro exitoso! Por favor inicia sesión.");
        }
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
    }
    setUser(null);
    localStorage.removeItem('hg_user');
    setActiveTab('dashboard');
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email }),
      });
      const data = await response.json();
      if (data.success) alert("Se ha enviado un correo con tu contraseña.");
      else setAuthError(data.error);
    } catch (err) {
      setAuthError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setAdminUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'admin' && user?.role === 'admin') {
      fetchAdminUsers();
    }
  }, [activeTab, user]);

  const handleScan = useCallback(async (barcode: string) => {
    if (isLoading) return;
    
    setIsScanning(false);
    setIsLoading(true);
    setError(null);
    setActiveTab('scanner');

    const messages = ["Buscando producto...", "Calculando macros...", "Casi listo...", "¡Ya lo tengo!"];
    let msgIdx = 0;
    const interval = setInterval(() => {
      setLoadingMsg(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 1500);

    try {
      const product = await getProductByBarcode(barcode);
      if (product) {
        setCurrentProduct(product);
        setSearchResults([]);
        setSearchQuery('');
        setHistory(prev => {
          const exists = prev.find(p => p.barcode === barcode);
          if (exists) return prev;
          return [product, ...prev].slice(0, 10);
        });
      } else {
        setError("PRODUCTO NO ENCONTRADO");
      }
    } catch (err) {
      setError("ERROR DE RED");
    } finally {
      setIsLoading(false);
      clearInterval(interval);
    }
  }, [isLoading]);

  const handleSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setCurrentProduct(null);
    setIsScanning(false);
    
    try {
      const results = await searchProducts(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError("PRODUCTO NO ENCONTRADO");
      }
    } catch (err) {
      setError("ERROR AL BUSCAR");
    } finally {
      setIsSearching(false);
    }
  };

  const addToDaily = async (product: ProductInfo, amount: number, category: string = 'Snacks') => {
    if (user) {
      try {
        await fetch(`/api/user/${user.id}/consumed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: { ...product, category }, amount }),
        });
      } catch (err) {
        console.error("Error saving consumed product:", err);
      }
    }
    setConsumedProducts(prev => [...prev, { ...product, amount, timestamp: Date.now(), category: category as any }]);
    setCurrentProduct(null);
    setActiveTab('dashboard');
  };

  const removeConsumed = async (timestamp: number) => {
    if (user) {
      try {
        await fetch(`/api/user/${user.id}/consumed/${timestamp}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error("Error deleting consumed product:", err);
      }
    }
    setConsumedProducts(prev => prev.filter(p => p.timestamp !== timestamp));
  };

  const handleAnalyzeImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setCurrentProduct(null);
    setLoadingMsg("Analizando plato...");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const product = await analyzeFoodImage(base64);
        if (product) {
          setCurrentProduct(product);
          setActiveTab('scanner');
        } else {
          setError("NO SE PUDO ANALIZAR LA IMAGEN");
        }
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("ERROR AL PROCESAR IMAGEN");
      setIsLoading(false);
    }
  };

  const toggleRunTracking = () => {
    if (isTrackingRun) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTrackingRun(false);

      // Save to history
      const calories = runnersDistance * (trackingMode === 'run' ? 60 : 40);
      const newActivity = {
        type: trackingMode,
        distance: runnersDistance,
        calories,
        date: new Date().toLocaleDateString('es-ES'),
        time: "00:00" // Placeholder
      };
      const updatedHistory = [newActivity, ...activityHistory];
      setActivityHistory(updatedHistory);
      localStorage.setItem('hg_activity_history', JSON.stringify(updatedHistory));
      
      // Motivational message
      const msg = trackingMode === 'run' 
        ? `¡Increíble carrera! Has quemado ${calories.toFixed(0)} kcal. ¡Sigue así!` 
        : `¡Buena caminata! ${runnersDistance.toFixed(2)}km más para tu objetivo.`;
      setMotivation(msg);
      
      // Reset current distance
      setRunnersDistance(0);
    } else {
      if (!navigator.geolocation) {
        alert("Geolocalización no soportada");
        return;
      }

      setIsTrackingRun(true);
      let lastPos: {lat: number, lng: number} | null = null;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (lastPos) {
            const dist = calculateDistance(lastPos.lat, lastPos.lng, newPos.lat, newPos.lng);
            setRunnersDistance(prev => prev + dist);
          }
          lastPos = newPos;
          setRunPath(prev => [...prev, newPos]);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toggleFavorite = (item: ShoppingItem) => {
    setShoppingFavorites(prev => {
      const exists = prev.find(f => f.name === item.name);
      if (exists) return prev.filter(f => f.name !== item.name);
      return [...prev, { ...item, isFavorite: true }];
    });
  };

  const handleSupermarketSearch = async (query: string, supermarket: string) => {
    setIsShoppingLoading(true);
    try {
      const results = await searchSupermarketProducts(query, supermarket);
      setShoppingList(prev => [...prev, ...results]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsShoppingLoading(false);
    }
  };
  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setCurrentProduct(null);

    const messages = ["Leyendo imagen...", "Buscando código...", "Analizando macros...", "¡Casi listo!"];
    let msgIdx = 0;
    const interval = setInterval(() => {
      setLoadingMsg(messages[msgIdx % messages.length]);
      msgIdx++;
    }, 1500);

    try {
      const html5QrCode = new Html5Qrcode("reader-hidden");
      const result = await html5QrCode.scanFile(file, true);
      if (result) {
        await handleScan(result);
      }
    } catch (err) {
      setError("CÓDIGO NO DETECTADO");
      setIsLoading(false);
    } finally {
      clearInterval(interval);
      if (event.target) event.target.value = '';
    }
  };

  const handleSendMessage = async (overrideMessage?: string) => {
    const message = overrideMessage || chatInput;
    if ((!message.trim() && !selectedFile) || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    const remaining = {
      calories: Math.max(0, 2000 - dailyTotals.calories),
      protein: Math.max(0, 150 - dailyTotals.protein),
      carbs: Math.max(0, 250 - dailyTotals.carbs),
      fat: Math.max(0, 70 - dailyTotals.fat),
    };

    try {
      let base64File = '';
      if (selectedFile) {
        const reader = new FileReader();
        base64File = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(selectedFile);
        });
      }

      const response = await getChatResponse([...chatMessages, userMsg], remaining, userProfile, base64File);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setSelectedFile(null);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Error al conectar con el coach." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateWorkout = async () => {
    setIsWorkoutLoading(true);
    try {
      const currentDay = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    const routine = await generateWorkoutRoutine(userProfile, currentDay);
      if (routine) setWorkoutRoutine(routine);
    } catch (err) {
      console.error(err);
    } finally {
      setIsWorkoutLoading(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    setIsShoppingLoading(true);
    const remaining = {
      calories: Math.max(0, (userProfile.stepGoal ? 2000 : 2000) - dailyTotals.calories), // Fallback to 2000 if goal not set
      protein: Math.max(0, 150 - dailyTotals.protein),
      carbs: Math.max(0, 250 - dailyTotals.carbs),
      fat: Math.max(0, 70 - dailyTotals.fat),
    };
    try {
      const list = await generateShoppingList(userProfile, remaining, shoppingRequest, shoppingBudget === '' ? undefined : shoppingBudget);
      setShoppingList(prev => {
        const existingNames = new Set(prev.map(i => i.name));
        const newItems = list.filter(i => !existingNames.has(i.name));
        return [...prev, ...newItems];
      });
      setShoppingRequest('');
      setShoppingBudget('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsShoppingLoading(false);
    }
  };

  const addToShoppingList = (name: string, supermarket: string = 'General', price: number = 0) => {
    setShoppingList(prev => {
      if (prev.find(i => i.name === name)) return prev;
      return [...prev, { name, supermarket, estimatedPrice: price }];
    });
    setActiveTab('shopping');
  };

  const motivationalPhrases = [
    "El único entrenamiento malo es el que no ocurrió.",
    "Tu cuerpo puede aguantar casi cualquier cosa. Es a tu mente a la que tienes que convencer.",
    "No te detengas cuando estés cansado, detente cuando hayas terminado.",
    "La disciplina es hacer lo que hay que hacer, incluso cuando no quieres hacerlo.",
    "Hoy es otra oportunidad para ser mejor que ayer.",
    "La fuerza no viene de la capacidad física, viene de una voluntad indomable."
  ];

  const [motivation, setMotivation] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivation(motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);
    }, 60000); // Rotate every minute
    return () => clearInterval(interval);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-emerald-50/90 dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-emerald-100 dark:border-zinc-800 p-10 space-y-10"
        >
          <div className="text-center space-y-4">
            <Logo className="w-24 h-24 mx-auto" />
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">HolaGordi!</h1>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Tu compañero de salud inteligente</p>
            </div>
          </div>

          <form onSubmit={authMode === 'forgot' ? handleForgotPassword : handleAuth} className="space-y-5">
            {authMode === 'register' && (
              <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Nombre de Usuario</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 outline-none text-zinc-950 dark:text-white transition-all"
                  placeholder="Tu nombre"
                />
              </div>
            </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="email" 
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 outline-none text-zinc-950 dark:text-white transition-all"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>
            {authMode !== 'forgot' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Contraseña</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="password" 
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5 outline-none text-zinc-950 dark:text-white transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {authError && (
              <p className="text-[10px] font-bold text-red-500 uppercase text-center">{authError}</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl py-5 font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {authMode === 'login' && <LogIn className="w-5 h-5" />}
                  {authMode === 'register' && <UserPlus className="w-5 h-5" />}
                  {authMode === 'forgot' && <Send className="w-5 h-5" />}
                  {authMode === 'login' ? 'Iniciar Sesión' : authMode === 'register' ? 'Registrarse' : 'Enviar Instrucciones'}
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
            <div className="flex flex-col gap-3 items-center">
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                {authMode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
              {authMode === 'login' && (
                <button 
                  onClick={() => setAuthMode('forgot')}
                  className="text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Persist shopping list to server
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try {
        const items = [
          ...shoppingList.map(i => ({ ...i, isFavorite: false })),
          ...shoppingFavorites.map(i => ({ ...i, isFavorite: true }))
        ];
        await fetch(`/api/user/${user.id}/shopping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
      } catch (err) {
        console.error("Error syncing shopping list:", err);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [user, shoppingList, shoppingFavorites]);

  // Persist profile to server
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/user/${user.id}/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userProfile),
        });
      } catch (err) {
        console.error("Error syncing profile:", err);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [user, userProfile]);

  return (
    <div className="min-h-screen bg-emerald-50/30 dark:bg-zinc-950 text-zinc-950 dark:text-white font-sans selection:bg-emerald-900 dark:selection:bg-white selection:text-white dark:selection:text-zinc-900 pb-24 relative overflow-hidden transition-colors">
      <AnimatePresence>
        {showTutorial && (
          <Tutorial 
            profile={userProfile}
            onUpdateProfile={setUserProfile}
            onComplete={() => {
              setShowTutorial(false);
              setUserProfile(prev => ({ ...prev, hasSeenTutorial: true }));
            }} 
          />
        )}
      </AnimatePresence>

      {/* Artistic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-orange-500/5 dark:bg-orange-500/10 blur-[150px] rounded-full" />
      </div>
      
      <div id="reader-hidden" className="hidden"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-emerald-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-emerald-100 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                {formatCurrentDate()}
              </span>
              <div className="flex items-center gap-3">
                <Logo className="w-10 h-10" />
                <div>
                  <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-zinc-900 dark:from-white via-emerald-600 to-zinc-900 dark:to-white bg-clip-text text-transparent leading-none">HolaGordi!</h1>
                  <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Tu asistente saludable</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isSyncing && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20 animate-pulse">
                  <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
                  <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Sync</span>
                </div>
              )}
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all border shadow-sm overflow-hidden",
                  activeTab === 'profile' 
                    ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900" 
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
              >
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all border border-zinc-200 dark:border-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 bg-white dark:bg-zinc-900 shadow-sm"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Daily Totals */}
              <section className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-4 bg-white/50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-emerald-100 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 flex-shrink-0">
                      {userProfile.avatarUrl ? (
                        <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                          <User className="w-8 h-8 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">¡Hola, {userProfile.displayName || user?.username}!</h2>
                      <p className="text-[10px] font-bold text-emerald-900/80 dark:text-emerald-400 uppercase tracking-widest">Tu progreso de hoy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-emerald-500 text-white px-6 py-4 rounded-[2rem] shadow-lg shadow-emerald-500/20">
                    <div className="text-right">
                      <p className="text-4xl font-black tracking-tighter leading-none">{dailyTotals.calories.toFixed(0)}</p>
                      <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mt-1">kcal consumidas</p>
                    </div>
                    <div className="w-px h-10 bg-white/20" />
                    <Activity className="w-8 h-8 opacity-50" />
                  </div>
                </div>

                <div className="bg-emerald-500 rounded-[2.5rem] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Quote className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-serif italic leading-snug">
                      "{motivation}"
                    </p>
                  </div>
                </div>

                <div className="glass-card p-8 bg-emerald-50/40 grid grid-cols-3 gap-4">
                  <CircularProgress 
                    value={dailyTotals.protein} 
                    max={150} 
                    label="Proteína" 
                    color="#3b82f6" 
                  />
                  <CircularProgress 
                    value={dailyTotals.carbs} 
                    max={250} 
                    label="Carbos" 
                    color="#f59e0b" 
                  />
                  <CircularProgress 
                    value={dailyTotals.fat} 
                    max={70} 
                    label="Grasas" 
                    color="#10b981" 
                  />
                </div>
              </section>

              {/* Quick Stats Grid */}
              <section className="grid grid-cols-2 gap-4">
                {/* Steps */}
                <div className="glass-card p-6 bg-emerald-50/40 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-orange-50 rounded-2xl">
                      <Footprints className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest">Pasos</p>
                      <p className="text-xs font-black text-orange-500 uppercase tracking-tighter">~{(steps * 0.04).toFixed(0)} kcal</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={steps}
                      onChange={(e) => setSteps(Number(e.target.value))}
                      className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl px-4 py-3 font-black text-2xl text-zinc-950 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                      placeholder="0"
                    />
                  </div>
                  <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-orange-500 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (steps / userProfile.stepGoal) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Water */}
                <div className={cn(
                  "glass-card p-6 space-y-4 transition-all duration-500",
                  water < userProfile.waterGoal * 0.5 ? "bg-blue-50 border-blue-200" : "bg-emerald-50/40"
                )}>
                  <div className="flex justify-between items-start">
                    <div className={cn(
                      "p-3 rounded-2xl transition-colors",
                      water < userProfile.waterGoal * 0.5 ? "bg-blue-200" : "bg-blue-50"
                    )}>
                      <Droplets className={cn("w-6 h-6", water < userProfile.waterGoal * 0.5 ? "text-blue-600 animate-bounce" : "text-blue-500")} />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black tracking-tighter text-zinc-950">{Math.floor(water / 0.25)} <span className="text-[10px] font-bold text-emerald-900/60 uppercase">Vasos</span></p>
                      <p className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest">{water.toFixed(2)}L</p>
                    </div>
                  </div>
                  {water < userProfile.waterGoal * 0.5 && (
                    <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest animate-pulse">¡Bebe más agua!</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => setWater(prev => Math.max(0, prev - 0.25))} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl font-black text-xs transition-colors">-</button>
                    <button onClick={() => setWater(prev => prev + 0.25)} className="flex-1 py-2 bg-blue-500 text-white rounded-xl font-black text-xs transition-colors shadow-lg shadow-blue-500/20">+</button>
                  </div>
                </div>
              </section>

              {/* Creatine & Exercise & Reset */}
              <section className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setCreatine(!creatine)}
                  className={cn(
                    "p-5 flex justify-between items-center transition-all rounded-2xl border-2",
                    creatine 
                      ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white border-zinc-100 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Zap className={cn("w-5 h-5", creatine ? "text-white" : "text-emerald-500")} />
                    <span className={cn("font-bold uppercase text-[10px] tracking-wider", creatine ? "text-white" : "text-zinc-900")}>Creatina</span>
                  </div>
                  {creatine && <CheckCircle2 className="w-5 h-5 text-white" />}
                </button>
                <button 
                  onClick={() => setExerciseDone(!exerciseDone)}
                  className={cn(
                    "p-5 flex justify-between items-center transition-all rounded-2xl border-2",
                    exerciseDone 
                      ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/30" 
                      : "bg-white border-zinc-100 shadow-sm"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Dumbbell className={cn("w-5 h-5", exerciseDone ? "text-white" : "text-emerald-500")} />
                    <span className={cn("font-bold uppercase text-[10px] tracking-wider", exerciseDone ? "text-white" : "text-zinc-900")}>Ejercicio</span>
                  </div>
                  {exerciseDone && <CheckCircle2 className="w-5 h-5 text-white" />}
                </button>
              </section>

              {/* Consumed List */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Registro Diario</h3>
                  <div className="flex gap-2">
                    {['Desayuno', 'Comida', 'Cena', 'Snacks'].map(cat => (
                      <span key={cat} className="text-[8px] font-black text-zinc-300 uppercase tracking-tighter">{cat}</span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  {['Desayuno', 'Comida', 'Cena', 'Snacks'].map(category => {
                    const items = consumedProducts.filter(p => (p.category || 'Snacks') === category);
                    if (items.length === 0) return null;
                    
                    return (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                          <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">{category}</h4>
                        </div>
                        <div className="space-y-2">
                          {items.map((p) => (
                            <div key={p.timestamp} className="glass-card p-4 bg-emerald-50/40 flex justify-between items-center group hover:border-emerald-200 transition-all">
                              <div className="space-y-0.5">
                                <p className="font-black text-sm text-zinc-900">{p.name}</p>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                  {p.amount}{p.unit} • {((p.caloriesPer100 / 100) * p.amount).toFixed(0)} kcal
                                </p>
                              </div>
                              <button onClick={() => removeConsumed(p.timestamp)} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-zinc-200 hover:text-red-500">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {consumedProducts.length === 0 && (
                    <div className="text-center py-16 bg-zinc-50 rounded-[2.5rem] border-2 border-dashed border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em]">Nada registrado aún</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'scanner' && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Escáner y Búsqueda</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab('history' as any)} 
                    className="w-10 h-10 flex items-center justify-center bg-emerald-50/40 border border-emerald-100 rounded-xl shadow-sm hover:bg-emerald-100/50 transition-colors"
                    title="Historial"
                  >
                    <History className="w-5 h-5 text-zinc-500" />
                  </button>
                  <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <input type="file" accept="image/*" capture="environment" className="hidden" id="analyze-input" onChange={handleAnalyzeImage} />
                  <button onClick={() => fileInputRef.current?.click()} className="w-10 h-10 flex items-center justify-center bg-emerald-50/40 border border-emerald-100 rounded-xl shadow-sm hover:bg-emerald-100/50 transition-colors" title="Escanear Código"><ImageIcon className="w-5 h-5 text-zinc-500" /></button>
                  <button onClick={() => document.getElementById('analyze-input')?.click()} className="w-10 h-10 flex items-center justify-center bg-emerald-50/40 border border-emerald-100 rounded-xl shadow-sm hover:bg-emerald-100/50 transition-colors" title="Analizar Plato"><Camera className="w-5 h-5 text-emerald-500" /></button>
                  <button onClick={() => setIsScanning(!isScanning)} className={cn("primary-btn flex items-center gap-2 h-10 px-4", isScanning && "bg-red-500 hover:bg-red-600")}>
                    {isScanning ? <X className="w-4 h-4" /> : <Scan className="w-4 h-4" />}
                    <span className="text-xs font-bold uppercase">{isScanning ? "Stop" : "Scan"}</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <input 
                  type="text" 
                  placeholder="Busca producto (ej: Jamón Mercadona)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-emerald-50/40 border border-emerald-100 rounded-2xl px-5 py-4 pr-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-900/5 text-zinc-950 transition-all"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </form>

              {!searchQuery && (
                <div className="rounded-2xl overflow-hidden border border-emerald-100 shadow-sm bg-emerald-50/40">
                  <Scanner onScan={handleScan} isScanning={isScanning} />
                </div>
              )}

              <AnimatePresence mode="wait">
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 space-y-4 glass-card bg-emerald-50/40">
                    <Loader2 className="w-10 h-10 text-zinc-900 animate-spin" />
                    <p className="font-bold uppercase tracking-widest text-[10px] text-emerald-800/60">{loadingMsg}</p>
                  </motion.div>
                )}

                {error && !isLoading && !isSearching && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-center">
                    {error}
                  </motion.div>
                )}

                {currentProduct && !isLoading && (
                  <ProductCard product={currentProduct} onAdd={addToDaily} onAddToShoppingList={addToShoppingList} />
                )}

                {searchResults.length > 0 && !isSearching && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                    <h3 className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest px-1">Resultados de búsqueda</h3>
                    {searchResults.map((product, idx) => (
                      <div 
                        key={idx} 
                        className="glass-card bg-white p-4 flex justify-between items-center cursor-pointer hover:border-zinc-300 transition-all group"
                        onClick={() => {
                          setCurrentProduct(product);
                          setSearchResults([]);
                          setSearchQuery('');
                        }}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-sm text-zinc-900 group-hover:text-emerald-600 transition-colors">{product.name}</p>
                          <p className="text-[10px] font-medium text-emerald-800/60 uppercase tracking-tight">
                            {product.brand} • {product.caloriesPer100} kcal/100{product.unit}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isScanning && !currentProduct && !isLoading && !isSearching && searchResults.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center py-16 space-y-4 glass-card bg-emerald-50/40">
                    <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto border border-zinc-100">
                      <Scan className="w-7 h-7 text-zinc-300" />
                    </div>
                    <p className="font-bold text-sm text-zinc-400 uppercase tracking-widest">Listo para escanear</p>
                  </div>
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleScan("5449000000996")}
                      className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 hover:text-zinc-500 transition-colors border-b border-zinc-200"
                    >
                      Simular Coca-Cola
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'shopping' && (
            <motion.div key="shopping" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-widest">Lista de la Compra</h2>
                <button 
                  onClick={() => setShoppingList([])}
                  className="text-[10px] font-bold text-red-500 uppercase"
                >
                  Limpiar Lista
                </button>
              </div>

              {/* IA Generation Box */}
              <div className="glass-card bg-emerald-900 text-emerald-50 p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black uppercase tracking-tighter">Generador Inteligente</h3>
                </div>
                <p className="text-[10px] font-bold text-emerald-200/60 uppercase tracking-widest">
                  Pide lo que necesites (ej: "comida vegetariana", "solo caprichos", "dieta keto")
                </p>
                <div className="space-y-3">
                  <textarea 
                    value={shoppingRequest}
                    onChange={(e) => setShoppingRequest(e.target.value)}
                    placeholder="¿Qué tipo de compra quieres hacer?"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 placeholder:text-emerald-100/30 text-white min-h-[80px]"
                  />
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-100/50 text-xs">€</span>
                      <input 
                        type="number"
                        value={shoppingBudget}
                        onChange={(e) => setShoppingBudget(e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder="Presupuesto"
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-7 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50 placeholder:text-emerald-100/30 text-white"
                      />
                    </div>
                    <button 
                      onClick={handleGenerateShoppingList}
                      disabled={isShoppingLoading}
                      className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-[10px] uppercase px-6 py-2 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isShoppingLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                      Generar
                    </button>
                  </div>
                </div>
              </div>

              {/* Supermarket Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['Todos', 'Mercadona', 'Carrefour', 'Lidl', 'Aldi', 'Favoritos'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSupermarket(s)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                      selectedSupermarket === s 
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md" 
                        : "bg-white dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    )}
                  >
                    {s === 'Favoritos' ? <Star className="w-3 h-3 inline mr-1" /> : <Store className="w-3 h-3 inline mr-1" />}
                    {s}
                  </button>
                ))}
              </div>

              <div className="glass-card bg-emerald-50/40 p-4 space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={selectedSupermarket !== 'Todos' && selectedSupermarket !== 'Favoritos' ? `Buscar en ${selectedSupermarket}...` : "Añadir alimento..."}
                    value={shoppingSearch}
                    onChange={(e) => setShoppingSearch(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (selectedSupermarket !== 'Todos' && selectedSupermarket !== 'Favoritos') {
                          handleSupermarketSearch(shoppingSearch, selectedSupermarket);
                          setShoppingSearch('');
                        } else {
                          addToShoppingList(shoppingSearch, selectedSupermarket === 'Favoritos' ? 'General' : selectedSupermarket);
                          setShoppingSearch('');
                        }
                      }
                    }}
                  />
                  {selectedSupermarket !== 'Todos' && selectedSupermarket !== 'Favoritos' && (
                    <button 
                      onClick={() => handleSupermarketSearch(shoppingSearch, selectedSupermarket)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {(() => {
                    const filteredList = selectedSupermarket === 'Favoritos' 
                      ? shoppingFavorites 
                      : shoppingList.filter(item => selectedSupermarket === 'Todos' || item.supermarket === selectedSupermarket);

                    if (filteredList.length === 0) {
                      return (
                        <div className="text-center py-12 space-y-3">
                          <ShoppingCart className="w-8 h-8 text-emerald-200 mx-auto" />
                          <p className="text-emerald-800/40 text-[10px] font-bold uppercase">Lista vacía</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        {filteredList.map((item, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-zinc-50 rounded-lg border border-zinc-100 group">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleFavorite(item)}
                                className={cn("transition-colors", shoppingFavorites.find(f => f.name === item.name) ? "text-yellow-500" : "text-zinc-200 hover:text-yellow-500")}
                              >
                                <Star className="w-4 h-4 fill-current" />
                              </button>
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-zinc-950">{item.name}</span>
                                <span className="text-[9px] font-bold text-emerald-900/60 uppercase tracking-tighter">
                                  {item.supermarket} • {item.estimatedPrice.toFixed(2)}€
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedSupermarket === 'Favoritos' && (
                                <button 
                                  onClick={() => addToShoppingList(item.name, item.supermarket, item.estimatedPrice)}
                                  className="p-2 hover:bg-emerald-50 rounded-xl transition-colors text-zinc-300 hover:text-emerald-500"
                                  title="Añadir a la lista"
                                >
                                  <Zap className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => {
                                if (selectedSupermarket === 'Favoritos') {
                                  toggleFavorite(item);
                                } else {
                                  setShoppingList(prev => prev.filter((_, idx) => idx !== i));
                                }
                              }}>
                                <X className="w-4 h-4 text-zinc-300 group-hover:text-red-500 transition-colors" />
                              </button>
                            </div>
                          </div>
                        ))}
                          <div className="pt-4 border-t border-emerald-100 flex justify-between items-center px-1">
                            <span className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest">Estimación Total</span>
                            <span className="text-sm font-black text-zinc-950">
                              {filteredList.reduce((acc, curr) => acc + curr.estimatedPrice, 0).toFixed(2)}€
                            </span>
                          </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'coach' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-[calc(100vh-180px)]"
            >
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-6 pb-6 pr-2">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                      <MessageSquare className="w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black tracking-tighter">Tu Coach IA</h3>
                      <p className="text-xs text-zinc-400 font-medium max-w-[200px] mx-auto leading-relaxed">
                        Pregúntame sobre nutrición, pide un entrenamiento o analicemos tu progreso.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto pt-4">
                      {[
                        "¿Qué ceno hoy?",
                        "Rutina de glúteo",
                        "Analiza mi peso",
                        "Lista de compra"
                      ].map(suggestion => (
                        <button 
                          key={suggestion}
                          onClick={() => handleSendMessage(suggestion)}
                          className="p-3 bg-white border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-tighter hover:border-emerald-200 transition-all text-zinc-500"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] p-5 rounded-[2rem] shadow-sm",
                      msg.role === 'user' 
                        ? "bg-emerald-500 text-white rounded-tr-none shadow-emerald-500/20" 
                        : "bg-white border border-zinc-100 text-zinc-900 rounded-tl-none"
                    )}>
                      <div className="prose prose-sm prose-zinc max-w-none">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                      <p className={cn(
                        "text-[8px] font-black uppercase tracking-widest mt-3 opacity-50",
                        msg.role === 'user' ? "text-right" : "text-left"
                      )}>
                        {msg.role === 'user' ? 'Tú' : 'Coach IA'}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-zinc-100 p-5 rounded-[2rem] rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="pt-4 space-y-3">
                {selectedFile && (
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                      {selectedFile.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 truncate max-w-[100px]">{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-emerald-100 rounded-full">
                      <X className="w-3 h-3 text-emerald-500" />
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Escribe al Coach..."
                      className="w-full bg-white border border-zinc-100 rounded-2xl px-6 py-4 text-sm text-zinc-950 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <input 
                        type="file" 
                        id="chat-file" 
                        className="hidden" 
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      />
                      <button 
                        onClick={() => document.getElementById('chat-file')?.click()}
                        className="p-2 text-zinc-300 hover:text-emerald-500 transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={toggleListening}
                        className={cn(
                          "p-2 transition-colors",
                          isListening ? "text-red-500 animate-pulse" : "text-zinc-300 hover:text-emerald-500"
                        )}
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={!chatInput.trim() && !selectedFile}
                    className="p-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Motivational Phrase */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-3 flex items-center gap-4 relative overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-50" />
                <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                  <Quote className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-zinc-900 dark:text-white font-serif italic text-xs relative z-10 leading-tight">
                  "{motivation}"
                </p>
              </div>

              {!workoutRoutine ? (
                <div className="glass-card bg-emerald-50/40 p-6 space-y-6 text-center">
                  <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mx-auto border border-zinc-100 mb-2">
                    <Dumbbell className="w-8 h-8 text-zinc-200" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm">¿Listo para entrenar?</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest leading-relaxed">Genera una rutina personalizada basada en tu perfil y objetivos.</p>
                  </div>
                  <button 
                    onClick={handleGenerateWorkout}
                    disabled={isWorkoutLoading}
                    className="w-full primary-btn flex items-center justify-center gap-2 py-4"
                  >
                    {isWorkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    Generar Rutina con IA
                  </button>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-900 transition-colors"
                  >
                    Ajustar Perfil
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="glass-card bg-white dark:bg-zinc-900 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold dark:text-white">{workoutRoutine.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                            Rutina para el {workoutRoutine.day || 'día'}
                          </p>
                          <span className="text-zinc-300 dark:text-zinc-700 text-[10px] font-bold uppercase tracking-widest">•</span>
                          <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">
                            Enfoque: {workoutRoutine.focus}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleGenerateWorkout}
                          disabled={isWorkoutLoading}
                          className="text-[10px] font-bold text-emerald-500 uppercase hover:text-emerald-600 disabled:opacity-50"
                        >
                          {isWorkoutLoading ? 'Generando...' : 'Regenerar'}
                        </button>
                        <button 
                          onClick={() => setWorkoutRoutine(null)}
                          className="text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-900 dark:hover:text-white"
                        >
                          Perfil
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {workoutRoutine.exercises.map((ex, i) => {
                        const isCompleted = completedExercises.includes(ex.name);
                        return (
                          <div key={i} className={cn(
                            "bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border overflow-hidden shadow-sm transition-all",
                            isCompleted ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5" : "border-zinc-100 dark:border-white/10"
                          )}>
                            <div className="p-5 space-y-4">
                              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-white/5 pb-3">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => {
                                      const newCompleted = isCompleted 
                                        ? completedExercises.filter(name => name !== ex.name)
                                        : [...completedExercises, ex.name];
                                      setCompletedExercises(newCompleted);
                                      localStorage.setItem('hg_completed_exercises', JSON.stringify(newCompleted));
                                    }}
                                    className={cn(
                                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                      isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-emerald-200 bg-emerald-50/40"
                                    )}
                                  >
                                    {isCompleted && <Check className="w-4 h-4" />}
                                  </button>
                                  <h4 className={cn(
                                    "text-lg font-black tracking-tight uppercase transition-all",
                                    isCompleted ? "text-emerald-600 line-through opacity-50" : "text-zinc-900 dark:text-white"
                                  )}>{ex.name}</h4>
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex flex-col items-center bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 dark:border-emerald-500/30 px-3 py-1 rounded-lg">
                                    <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase leading-none mb-1">Series</span>
                                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 leading-none">{ex.sets}</span>
                                  </div>
                                  <div className="flex flex-col items-center bg-zinc-100 dark:bg-zinc-700/50 border border-zinc-200 dark:border-white/10 px-3 py-1 rounded-lg">
                                    <span className="text-[8px] font-bold text-zinc-500 dark:text-zinc-400 uppercase leading-none mb-1">Reps</span>
                                    <span className="text-sm font-black text-zinc-900 dark:text-white leading-none">{ex.reps}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <div className="flex items-center gap-2">
                                  <Activity className="w-3 h-3 text-emerald-500" />
                                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Técnica y Ejecución</span>
                                </div>
                                <div className="relative">
                                  <div className="absolute -left-3 top-0 bottom-0 w-1 bg-emerald-500/30 rounded-full"></div>
                                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium pl-3">
                                    {ex.technique}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setExerciseDone(true);
                      setActiveTab('dashboard');
                    }}
                    className="w-full bg-white border border-zinc-200 p-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Marcar como Completado
                  </button>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'runners' && (
            <motion.div
              key="runners"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-2xl">
                <button 
                  onClick={() => setTrackingMode('run')}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    trackingMode === 'run' ? "bg-white text-emerald-500 shadow-sm" : "text-zinc-400"
                  )}
                >
                  Running
                </button>
                <button 
                  onClick={() => setTrackingMode('walk')}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    trackingMode === 'walk' ? "bg-white text-emerald-500 shadow-sm" : "text-zinc-400"
                  )}
                >
                  Walking
                </button>
              </div>

              <div className="glass-card bg-emerald-50/40 p-8 text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                
                <div className="space-y-2">
                  <h3 className="text-4xl font-black tracking-tighter text-zinc-900">
                    {trackingMode === 'run' ? 'Running' : 'Walking'}
                  </h3>
                  <p className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Registra tu actividad</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tighter text-emerald-500">{runnersDistance.toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Kilómetros</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tighter text-emerald-500">--:--</p>
                    <p className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">Tiempo</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {!isTrackingRun ? (
                    <button 
                      onClick={toggleRunTracking}
                      className="w-full primary-btn py-5 flex items-center justify-center gap-2 text-sm"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Empezar {trackingMode === 'run' ? 'Carrera' : 'Caminata'}
                    </button>
                  ) : (
                    <button 
                      onClick={toggleRunTracking}
                      className="w-full bg-red-500 text-white rounded-2xl py-5 font-black text-sm shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                    >
                      <Square className="w-5 h-5 fill-current" />
                      Finalizar Actividad
                    </button>
                  )}
                </div>
              </div>

              {/* Activity History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">Historial de Actividad</h3>
                  <BarChart3 className="w-4 h-4 text-zinc-300" />
                </div>
                <div className="space-y-3">
                  {activityHistory.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100">
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">No hay actividades aún</p>
                    </div>
                  ) : (
                    activityHistory.map((activity, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-5 bg-white flex items-center justify-between group hover:border-emerald-200 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            activity.type === 'run' ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500"
                          )}>
                            {activity.type === 'run' ? <Flame className="w-6 h-6" /> : <Footprints className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-black text-sm text-zinc-900">{activity.type === 'run' ? 'Carrera' : 'Caminata'}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                              {activity.distance.toFixed(2)}km • {activity.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-500">{activity.calories?.toFixed(0) || 0}</p>
                          <p className="text-[8px] font-bold text-zinc-300 uppercase">kcal</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-emerald-800/60 uppercase tracking-widest">Mi Perfil</h2>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="text-[10px] font-bold text-emerald-800/60 uppercase hover:text-emerald-900"
                >
                  Cerrar
                </button>
              </div>

              <div className="glass-card bg-emerald-50/40 p-6 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className="w-20 h-20 bg-emerald-900 rounded-3xl flex items-center justify-center shadow-xl overflow-hidden border-2 border-emerald-50">
                        {userProfile.avatarUrl ? (
                          <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <User className="w-10 h-10 text-emerald-50" />
                        )}
                      </div>
                      <input 
                        type="file" 
                        id="avatar-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setUserProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button 
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white"
                      >
                        <CameraIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-zinc-950">{userProfile.displayName || user?.username}</h3>
                      <p className="text-[10px] font-bold text-emerald-800/60 uppercase tracking-widest">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setShowTutorial(true)}
                      className="p-3 bg-emerald-100/50 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-all"
                      title="Ver Tutorial"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Goals Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    Mis Objetivos Diarios
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Meta de Pasos</label>
                      <input 
                        type="number" 
                        value={userProfile.stepGoal}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, stepGoal: Number(e.target.value) }))}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-950 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Meta de Agua (L)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={userProfile.waterGoal}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, waterGoal: Number(e.target.value) }))}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-950 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Permisos del Dispositivo
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <Camera className="w-5 h-5 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-600">Acceso a Cámara</span>
                      </div>
                      <button 
                        onClick={() => setUserProfile(prev => ({ ...prev, permissions: { ...prev.permissions, camera: !prev.permissions.camera } }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          userProfile.permissions.camera ? "bg-emerald-500" : "bg-zinc-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          userProfile.permissions.camera ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-600">Acceso a GPS</span>
                      </div>
                      <button 
                        onClick={() => setUserProfile(prev => ({ ...prev, permissions: { ...prev.permissions, gps: !prev.permissions.gps } }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          userProfile.permissions.gps ? "bg-emerald-500" : "bg-zinc-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          userProfile.permissions.gps ? "left-7" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Nombre para mostrar</label>
                    <input 
                      type="text" 
                      value={userProfile.displayName || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-950 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      placeholder="Tu nombre público"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Frase Motivadora Personal</label>
                    <input 
                      type="text" 
                      value={userProfile.motivationalQuote || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, motivationalQuote: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-950 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                      placeholder="Ej: ¡Tú puedes con todo!"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Peso (kg)</label>
                    <input 
                      type="number" 
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, weight: Number(e.target.value) }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Altura (cm)</label>
                    <input 
                      type="number" 
                      value={userProfile.height}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Edad</label>
                    <input 
                      type="number" 
                      value={userProfile.age}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Género</label>
                    <select 
                      value={userProfile.gender}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    >
                      <option value="male">Masculino</option>
                      <option value="female">Femenino</option>
                      <option value="other">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Objetivo Principal</label>
                    <select 
                      value={userProfile.goal}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, goal: e.target.value as any }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-950 focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    >
                      <option value="lose">Perder Peso / Definición</option>
                      <option value="maintain">Mantenimiento</option>
                      <option value="gain">Ganar Músculo / Volumen</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Lesiones o Limitaciones</label>
                    <textarea 
                      placeholder="Ej: Dolor de rodilla, hombro operado..."
                      value={userProfile.injuries || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, injuries: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-950 min-h-[60px] focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Personalidad del Coach IA</h4>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] text-zinc-500 font-medium leading-relaxed">Indica cómo quieres que el Coach interactúe contigo (ej: "Sé muy estricto", "Usa un tono motivador", "Explícame todo con detalle científico").</p>
                    <textarea 
                      placeholder="Escribe aquí tus preferencias de interacción..."
                      value={userProfile.aiInstructions || ''}
                      onChange={(e) => setUserProfile(prev => ({ ...prev, aiInstructions: e.target.value }))}
                      className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-950 min-h-[100px] focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full primary-btn py-5 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Guardar y Continuar
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && user?.role === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Panel de Administrador</h2>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className="text-[10px] font-bold text-zinc-400 uppercase hover:text-zinc-900"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card bg-white p-4 text-center">
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Usuarios Totales</p>
                  <p className="text-2xl font-black">{adminUsers.length}</p>
                </div>
                <div className="glass-card bg-white p-4 text-center">
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Activos Ahora</p>
                  <p className="text-2xl font-black text-emerald-500">{adminUsers.filter(u => u.is_active).length}</p>
                </div>
              </div>

              <div className="glass-card bg-white overflow-hidden">
                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest">Gestión de Usuarios</h3>
                </div>
                <div className="divide-y divide-zinc-100">
                  {adminUsers.map(u => (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm">{u.username}</p>
                            {u.is_active ? (
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            ) : null}
                          </div>
                          <p className="text-[10px] text-zinc-400 font-medium">{u.email}</p>
                        </div>
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                          u.role === 'admin' ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-500"
                        )}>
                          {u.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[8px] text-zinc-400 uppercase font-bold">
                          Último acceso: {u.last_login ? new Date(u.last_login).toLocaleString() : 'Nunca'}
                        </p>
                        <button 
                          onClick={async () => {
                            const newPass = prompt("Nueva contraseña para " + u.username);
                            if (newPass) {
                              await fetch('/api/admin/reset-password', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: u.id, newPassword: newPass }),
                              });
                              alert("Contraseña actualizada");
                            }
                          }}
                          className="text-[8px] font-bold text-blue-500 uppercase hover:underline"
                        >
                          Restablecer Pass
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(activeTab as any) === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('scanner')} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Historial Reciente</h2>
              </div>
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-20 glass-card bg-white">
                    <History className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
                    <p className="font-bold uppercase tracking-widest text-[10px] text-zinc-300">Sin historial</p>
                  </div>
                ) : (
                  history.map((item, i) => (
                    <div key={`${item.barcode}-${i}`} className="glass-card bg-white p-4 flex justify-between items-center group">
                      <button
                        onClick={() => {
                          setCurrentProduct(item);
                          setActiveTab('scanner');
                        }}
                        className="flex-1 text-left"
                      >
                        <p className="font-bold text-zinc-900 text-sm">{item.name}</p>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{item.brand}</p>
                      </button>
                      <button 
                        onClick={() => addToShoppingList(item.name)}
                        className="p-2 text-zinc-300 hover:text-zinc-900 transition-colors"
                        title="Añadir a la lista"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-emerald-50/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-emerald-100 dark:border-zinc-800 px-2 py-3 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center gap-0.5">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard className="w-4 h-4" />} label="Home" />
          <NavButton active={activeTab === 'shopping'} onClick={() => setActiveTab('shopping')} icon={<ShoppingCart className="w-4 h-4" />} label="Lista" />
          <NavButton active={activeTab === 'runners'} onClick={() => setActiveTab('runners')} icon={<MapPin className="w-4 h-4" />} label="Run" />
          
          <button 
            onClick={() => setActiveTab('scanner')}
            className={cn(
              "w-10 h-10 -mt-8 bg-emerald-900 dark:bg-white rounded-xl shadow-lg shadow-emerald-900/20 dark:shadow-white/10 flex items-center justify-center transition-all active:scale-90 shrink-0",
              activeTab === 'scanner' ? "scale-110" : "scale-100"
            )}
          >
            <Scan className={cn("w-5 h-5", activeTab === 'scanner' ? "text-emerald-50 dark:text-zinc-900" : "text-emerald-50 dark:text-zinc-900")} />
          </button>

          <NavButton active={activeTab === 'coach'} onClick={() => setActiveTab('coach')} icon={<MessageSquare className="w-4 h-4" />} label="Coach" />
          <NavButton active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} icon={<Dumbbell className="w-4 h-4" />} label="Gym" />
        </div>
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all flex-1",
      active ? "text-emerald-900 dark:text-white" : "text-emerald-900/40 dark:text-zinc-600 hover:text-emerald-900/60 dark:hover:text-zinc-500"
    )}
  >
    {icon}
    <span className="text-[8px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);
