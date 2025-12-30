
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NewsItem, NewsScope, ChatMessage, InvestmentInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simula a extração de dados de um documento de identidade (OCR IA) para autopreenchimento
 */
export async function extractDataFromID(idNumber: string, idType: string, country: string): Promise<{ name: string, email: string, validatedCountry: string, validatedDocType: string, isValidated: boolean } | null> {
  try {
    const prompt = `Aja como um sistema de OCR avançado para documentos oficiais.
    Contexto do Documento: "${idNumber}".
    Tipo pretendido pelo utilizador: "${idType}".
    País sugerido: "${country}".
    
    Regras de Validação:
    1. Verifique se no contexto "República de Angola" ou o país "${country}" é mencionado como emissor.
    2. Identifique explicitamente o tipo de documento: "Bilhete de Identidade", "Passaporte" ou "Carta de Condução".
    3. Se houver correspondência, retorne isValidated: true.
    4. Gere um nome angolano/regional realista e um email baseado nesse nome.
    
    Retorne estritamente um JSON com as chaves: name, email, validatedCountry, validatedDocType, isValidated.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            email: { type: Type.STRING },
            validatedCountry: { type: Type.STRING },
            validatedDocType: { type: Type.STRING },
            isValidated: { type: Type.BOOLEAN }
          },
          required: ["name", "email", "validatedCountry", "validatedDocType", "isValidated"]
        }
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Erro no processamento OCR/IA:", error);
    return null;
  }
}

/**
 * Busca notícias e fofocas com Search Grounding exaustivo.
 * O modo 'Novidades' agora é um motor de tendências abrangente (Viral/Trends).
 */
export async function fetchCuratedNews(
  interests: string[], 
  scope: NewsScope = 'Nacional', 
  province: string = '',
  isNovidades: boolean = false,
  limit: number = 5
): Promise<NewsItem[]> {
  try {
    let contextPrompt = "";
    if (isNovidades) {
      contextPrompt = `Você é o "KIMBA Trends Engine", o motor de busca de novidades mais avançado de Angola. 
      Sua missão é varrer a web por tudo que é "Novo", "Viral" e "Tendência" em ${scope === 'Nacional' ? 'Angola (Local)' : 'o Mundo (Internacional)'}.
      Não se limite apenas a fofoca; busque novidades em tecnologia, cultura, política (incluindo polêmicas de deputados), celebridades, moda, economia de rua e eventos de última hora.
      
      Fontes de busca obrigatórias:
      - Redes Sociais: Facebook, Instagram, TikTok, X/Twitter (assuntos virais e hashtags em alta).
      - Sites de Entretenimento e Fofoca de referência.
      - Magazines de Estilo de Vida e Moda.
      - Portais Oficiais e Jornais de grande circulação para novidades factuais e polêmicas públicas.
      
      Gere ${limit} matérias dinâmicas, com títulos provocativos e imagens descritivas. 
      Retorne estritamente um JSON.`;
    } else {
      contextPrompt = `Você é um jornalista de elite. Varra a web por notícias sérias, econômicas e políticas de alta relevância em ${scope}. 
      Use fontes de referência jornalística. Gere ${limit} matérias.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contextPrompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              content: { type: Type.STRING },
              source: { type: Type.STRING },
              category: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              isVerified: { type: Type.BOOLEAN }
            },
            required: ["id", "title", "summary", "content", "source", "category", "imageUrl", "timestamp", "isVerified"]
          }
        }
      }
    });

    const items = response.text ? JSON.parse(response.text) : [];
    return items.map((item: any) => ({
      ...item,
      groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    }));
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return [];
  }
}

export async function summarizeNewsArticle(title: string, content: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise esta notícia: "${title}". Texto: "${content}". Forneça um resumo executivo em 3 tópicos.`,
    });
    return response.text || "Não foi possível gerar o resumo.";
  } catch (error) {
    return "Erro ao processar resumo.";
  }
}

export async function generateInvestmentInsight(): Promise<InvestmentInsight> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Gere um Insight de Investimento para o mercado Angolano hoje. Formate como JSON.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            analysis: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ["Baixo", "Moderado", "Alto"] },
            recommendation: { type: Type.STRING }
          },
          required: ["title", "analysis", "riskLevel", "recommendation"]
        }
      }
    });
    return response.text ? JSON.parse(response.text) : { title: "Indisponível", analysis: "Erro", riskLevel: "Moderado", recommendation: "Aguarde" };
  } catch (e) { return { title: "Indisponível", analysis: "Erro", riskLevel: "Moderado", recommendation: "Aguarde" }; }
}

export async function askKimbaAI(history: ChatMessage[], userInput: string, image?: { data: string; mimeType: string }): Promise<GenerateContentResponse> {
  const model = "gemini-3-pro-preview";
  const contents = history.map(h => ({ role: h.role, parts: h.parts }));
  const userParts: any[] = [{ text: userInput }];
  if (image) userParts.push({ inlineData: image });
  contents.push({ role: 'user', parts: userParts });
  return await ai.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction: "Você é o KIMBA, assistente de elite de Angola. Se solicitado sobre cotações, use ferramentas de busca se disponível.",
      thinkingConfig: { thinkingBudget: 16000 }
    }
  });
}

export async function fetchRealTimeMarketData(symbols: string[]): Promise<Record<string, { price: number, change: number }>> {
  try {
    const prompt = `Busque as cotações atuais para os seguintes ativos: ${symbols.join(', ')}. 
    Retorne um array de objetos JSON contendo 'symbol', 'price' e 'change'.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              price: { type: Type.NUMBER },
              change: { type: Type.NUMBER }
            },
            required: ["symbol", "price", "change"]
          }
        }
      }
    });

    const result: Record<string, { price: number, change: number }> = {};
    if (response.text) {
      const items = JSON.parse(response.text);
      if (Array.isArray(items)) {
        items.forEach((item: any) => {
          result[item.symbol] = { price: item.price, change: item.change };
        });
      }
    }
    return result;
  } catch (error) {
    return {};
  }
}

export async function fetchTransportRealtimeInfo(providerName: string, transportType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Forneça o status em tempo real sobre a operadora ${providerName} (${transportType}) em Angola hoje.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Sem info.";
  } catch (error) {
    return "Erro.";
  }
}

export async function fetchMaritimeAdvisory(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Forneça um boletim marítimo atualizado para a costa de Angola hoje.",
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Sem boletim.";
  } catch (error) {
    return "Erro.";
  }
}

export async function analyzePropertySurroundings(location: string, lat?: number, lng?: number): Promise<{text?: string, chunks: any[]}> {
  try {
    const contents = `Analise os arredores de ${location} em Angola.`;
    const config: any = { tools: [{ googleMaps: {} }] };
    if (lat && lng) {
      config.toolConfig = {
        retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
      };
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-09-2025",
      contents,
      config,
    });
    return {
      text: response.text,
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Erro.", chunks: [] };
  }
}

export async function generateProductImageSuggestion(base64Data: string, productName: string, mimeType: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: `Enhance this image into a professional studio shot for "${productName}".` }
        ]
      }
    });
    const candidates = response.candidates || [];
    if (candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}
