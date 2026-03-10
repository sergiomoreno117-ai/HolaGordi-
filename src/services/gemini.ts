import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ProductInfo {
  name: string;
  brand: string;
  caloriesPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  unit: 'g' | 'ml' | 'unidad';
  packageSize: number;
  barcode: string;
  category?: 'Desayuno' | 'Comida' | 'Cena' | 'Snack';
}

export interface UserProfile {
  displayName?: string;
  avatarUrl?: string;
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  goal: 'lose' | 'maintain' | 'gain';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  injuries?: string;
  aiInstructions?: string;
  hasSeenTutorial?: boolean;
  stepGoal: number;
  waterGoal: number;
  motivationalQuote?: string;
  permissions: {
    camera: boolean;
    gps: boolean;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface WorkoutRoutine {
  name: string;
  day?: string;
  focus: string;
  exercises: {
    name: string;
    sets: string;
    reps: string;
    technique: string;
  }[];
}

export interface ShoppingItem {
  name: string;
  supermarket: string;
  estimatedPrice: number;
  isFavorite?: boolean;
}

export async function getProductByBarcode(barcode: string): Promise<ProductInfo | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Barcode: ${barcode}. Identify product name, brand, package size (total weight/volume), and nutritional info (calories, protein, carbs, fat) ALWAYS PER 100g or 100ml. Use your internal knowledge first. Use search ONLY if you are 100% unsure. Be extremely fast.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            brand: { type: Type.STRING },
            caloriesPer100: { type: Type.NUMBER, description: "Calories per 100g or 100ml" },
            proteinPer100: { type: Type.NUMBER, description: "Protein in grams per 100g or 100ml" },
            carbsPer100: { type: Type.NUMBER, description: "Carbohydrates in grams per 100g or 100ml" },
            fatPer100: { type: Type.NUMBER, description: "Fat in grams per 100g or 100ml" },
            unit: { type: Type.STRING, enum: ["g", "ml"], description: "The unit of the product (g or ml)" },
            packageSize: { type: Type.NUMBER, description: "Total package size in the specified unit (g or ml)" },
          },
          required: ["name", "brand", "caloriesPer100", "proteinPer100", "carbsPer100", "fatPer100", "unit", "packageSize"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return { ...data, barcode };
  } catch (error) {
    console.error("Error fetching product info:", error);
    return null;
  }
}

export async function getChatResponse(messages: ChatMessage[], remainingMacros: any, profile: UserProfile, base64Image?: string): Promise<string> {
  try {
    const parts: any[] = [
      {
        text: `Eres un experto coach de nutrición y fitness para la app "HolaGordi!". 
        Tu personalidad debe ser: ${profile.aiInstructions || "Amigable, profesional y motivador."}
        
        DATOS DEL USUARIO:
        - Nombre: ${profile.displayName}
        - Objetivo: ${profile.goal}
        - Peso: ${profile.weight}kg, Altura: ${profile.height}cm
        - Macros restantes hoy: ${JSON.stringify(remainingMacros)}
        - Frase motivadora: ${profile.motivationalQuote}
        
        REGLAS DE RESPUESTA:
        1. Sé conciso pero útil.
        2. Usa listas con iconos (emojis) para estructurar la información.
        3. Si el usuario envía una imagen, analízala y dale feedback nutricional o de entrenamiento.
        4. Motiva al usuario usando su frase personal si es oportuno.
        5. Responde siempre en ESPAÑOL.
        
        Historial de conversación:
        ${messages.map(m => `${m.role === 'user' ? 'Usuario' : 'Coach'}: ${m.content}`).join('\n')}`
      }
    ];

    if (base64Image) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image.split(',')[1] || base64Image
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    return response.text || "Lo siento, no he podido procesar tu consulta.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Error al conectar con el coach.";
  }
}

export async function searchProducts(query: string): Promise<ProductInfo[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for products matching: "${query}". Provide a list of 5 real products available in Spain (e.g., Mercadona, Carrefour, Lidl). For each, include brand, calories, protein, carbs, and fat per 100g/ml.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              brand: { type: Type.STRING },
              caloriesPer100: { type: Type.NUMBER },
              proteinPer100: { type: Type.NUMBER },
              carbsPer100: { type: Type.NUMBER },
              fatPer100: { type: Type.NUMBER },
              unit: { type: Type.STRING, enum: ["g", "ml"] },
              packageSize: { type: Type.NUMBER },
              barcode: { type: Type.STRING, description: "Use 'SEARCH' if unknown" },
            },
            required: ["name", "brand", "caloriesPer100", "proteinPer100", "carbsPer100", "fatPer100", "unit", "packageSize", "barcode"],
          },
        },
      },
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Product search error:", error);
    return [];
  }
}

export async function generateWorkoutRoutine(profile: UserProfile, dayOfWeek: string): Promise<WorkoutRoutine | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una rutina de entrenamiento personalizada para el día ${dayOfWeek} en ESPAÑOL para un usuario con el siguiente perfil:
      Peso: ${profile.weight}kg, Altura: ${profile.height}cm, Edad: ${profile.age}, Objetivo: ${profile.goal}, Nivel de Actividad: ${profile.activityLevel}.
      Lesiones/Limitaciones: ${profile.injuries || "Ninguna"}.
      
      REQUISITOS CRÍTICOS:
      1. La rutina debe ser ESPECÍFICA para el día ${dayOfWeek}.
      2. Indica claramente el ENFOQUE muscular (ej. "Pecho y Bíceps", "Pierna y Glúteo").
      3. Todo el contenido debe estar en ESPAÑOL.
      4. ADAPTACIÓN A LESIONES: Si el usuario tiene lesiones (${profile.injuries}), evita ejercicios que las agraven y sugiere alternativas seguras.
      5. Usa nombres de ejercicios REALES y precisos.
      6. GUÍA DE TÉCNICA PASO A PASO: En el campo 'technique', proporciona una explicación detallada y estructurada de cómo realizar el ejercicio. Incluye:
         - Posición inicial (pies, manos, espalda).
         - Fase de ejecución (movimiento, rango de recorrido).
         - Respiración (cuándo inhalar y exhalar).
         - Consejos clave para evitar lesiones.
         Sé extremadamente descriptivo ya que el usuario no tiene imágenes de referencia.
      7. Incluye series y repeticiones coherentes con el objetivo.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nombre de la rutina en español" },
            day: { type: Type.STRING, description: "Día de la semana para el que es la rutina" },
            focus: { type: Type.STRING, description: "Grupos musculares trabajados (ej. Pecho y Tríceps)" },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nombre del ejercicio en español" },
                  sets: { type: Type.STRING },
                  reps: { type: Type.STRING },
                  technique: { type: Type.STRING, description: "Explicación detallada de la técnica en español" },
                },
                required: ["name", "sets", "reps", "technique"],
              },
            },
          },
          required: ["name", "day", "focus", "exercises"],
        },
      },
    });
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (error) {
    console.error("Workout generation error:", error);
    return null;
  }
}

export async function generateShoppingList(profile: UserProfile, remainingMacros: any, userRequest?: string, budget?: number): Promise<ShoppingItem[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una lista de la compra saludable en ESPAÑOL para un usuario con el siguiente perfil:
      Peso: ${profile.weight}kg, Objetivo: ${profile.goal}.
      Macros restantes para hoy: ${JSON.stringify(remainingMacros)}.
      ${userRequest ? `Petición específica del usuario: "${userRequest}"` : 'La lista debe incluir 5-7 artículos esenciales que les ayuden a alcanzar sus metas nutricionales.'}
      ${budget ? `Presupuesto máximo: ${budget}€` : ''}
      Distribuye los artículos entre supermercados comunes en España (Mercadona, Carrefour, Lidl, Aldi).
      Estima un precio aproximado para cada artículo.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              supermarket: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER },
            },
            required: ["name", "supermarket", "estimatedPrice"]
          }
        }
      },
    });
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Shopping list generation error:", error);
    return [];
  }
}

export async function searchSupermarketProducts(query: string, supermarket: string): Promise<ShoppingItem[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Busca productos de tipo "${query}" que se vendan específicamente en "${supermarket}" en España. 
      Devuelve una lista de 5 opciones reales con su nombre exacto y una estimación de precio actual.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              supermarket: { type: Type.STRING },
              estimatedPrice: { type: Type.NUMBER },
            },
            required: ["name", "supermarket", "estimatedPrice"]
          }
        },
      },
    });
    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Supermarket search error:", error);
    return [];
  }
}

export async function analyzeFoodImage(base64Image: string): Promise<ProductInfo | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: "Identifica este alimento o plato. Estima las cantidades mostradas y calcula la información nutricional (calorías, proteínas, carbohidratos, grasas) para la porción total estimada. Devuelve los datos como si fuera un producto de 100g/ml pero ajustado a la porción que ves."
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            brand: { type: Type.STRING, description: "Usa 'Casero' o 'Genérico' si no hay marca" },
            caloriesPer100: { type: Type.NUMBER, description: "Calorías estimadas para la porción vista" },
            proteinPer100: { type: Type.NUMBER, description: "Proteínas estimadas para la porción vista" },
            carbsPer100: { type: Type.NUMBER, description: "Carbohidratos estimados para la porción vista" },
            fatPer100: { type: Type.NUMBER, description: "Grasas estimadas para la porción vista" },
            unit: { type: Type.STRING, enum: ["g", "ml"] },
            packageSize: { type: Type.NUMBER, description: "Peso total estimado de la porción en g o ml" },
          },
          required: ["name", "brand", "caloriesPer100", "proteinPer100", "carbsPer100", "fatPer100", "unit", "packageSize"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return { ...data, barcode: "PHOTO_ANALYSIS" };
  } catch (error) {
    console.error("Image analysis error:", error);
    return null;
  }
}

