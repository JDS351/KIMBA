
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { NewsItem, NewsScope, ChatMessage, InvestmentInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simula a extração de dados de um documento de identidade (OCR IA) para autopreenchimento
 */
export async function extractDataFromID(idNumber: string, idType: string, country: string): Promise<{ name: string, email: string, validatedCountry: string, validatedDocType: string } | null> {
  try {
    const prompt = `Aja como um sistema de OCR e validação de identidade para Angola e outros países da CPLP. 
    Analise o contexto: Número de Documento: ${idNumber}, Tipo pretendido: ${idType}, País sugerido: ${country}.
    
    Regras:
    1. Identifique se o documento corresponde a "República de Angola" ou outro país.
    2. Identifique se é "Bilhete de Identidade", "Passaporte" ou "Carta de Condução".
    3. Gere um nome completo e email fictício mas realista baseado na região.
    
    Retorne apenas JSON com as chaves: name, email, validatedCountry, validatedDocType.`;
    
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
            validatedDocType: { type: Type.STRING }
          },
          required: ["name", "email", "validatedCountry", "validatedDocType"]
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
 * Busca cotações reais via Search Grounding
 */
export async function fetchRealTimeMarketData(symbols: string[]): Promise<Record<string, { price: number, change: number }>> {
  try {
    const prompt = `Busque as cotações atuais (preço e variação percentual 24h) para os seguintes ativos: ${symbols.join(', ')}. 
    Inclua dados da BODIVA para ativos angolanos, Pepperstone para ETFs, Blackrock para commodities e cotações de Cripto se necessário. 
    Retorne um array de objetos contendo 'symbol', 'price' e 'change'.`;

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
    console.error("Erro ao buscar dados de mercado via Gemini:", error);
    return {};
  }
}

/**
 * Busca notícias e fofocas com Search Grounding exaustivo
 */
export async function fetchCuratedNews(
  interests: string[], 
  scope: NewsScope = 'Nacional', 
  province: string = '',
  isNovidades: boolean = false,
  limit: number = 5
): Promise<NewsItem[]> {
  try {
    const contextPrompt = isNovidades 
      ? `Você é um curador de tendências angolano. Varra o Google e redes sociais por novidades recentes em ${scope}. Gere ${limit} matérias.`
      : `Você é um jornalista de elite angolano. Varra a web por notícias sérias sobre ${interests.join(', ')} em ${scope}. Gere ${limit} matérias.`;

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
      contents: "Gere um Insight de Investimento para o mercado Angolano hoje (BODIVA/Câmbio). Formate como JSON.",
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

/**
 * Gera uma sugestão de imagem profissional para um produto
 */
export async function generateProductImageSuggestion(base64Data: string, productName: string, mimeType: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: `Gere uma versão profissional desta imagem para o produto: ${productName}.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Analisa os arredores de um imóvel usando Maps Grounding
 */
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
    return { text: "Erro na análise.", chunks: [] };
  }
}

/**
 * Busca status em tempo real de transportes via Search Grounding
 */
export async function fetchTransportRealtimeInfo(providerName: string, transportType: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Forneça o status em tempo real e notícias recentes sobre a operadora de transporte ${providerName} (${transportType}) em Angola. Foque em disponibilidade e alertas de hoje.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "Informação indisponível no momento.";
  } catch (error) {
    return "Erro ao consultar status em tempo real.";
  }
}

/**
 * Busca avisos marítimos recentes via Search Grounding
 */
export async function fetchMaritimeAdvisory(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Forneça um boletim marítimo atualizado para a costa de Angola, incluindo Luanda e Cabinda. Mencione estado do mar e avisos aos navegantes.",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return response.text || "Boletim marítimo indisponível.";
  } catch (error) {
    return "Erro ao obter boletim marítimo.";
  }
}
