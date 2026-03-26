import { OPENROUTER_API_KEY, OPENROUTER_API_URL, OPENROUTER_MODEL, SYSTEM_PROMPT } from '../config/aiConfig';

/**
 * Envía un mensaje a OpenRouter (Deepseek) y retorna la respuesta del IA
 * @param {string} userMessage - Mensaje del usuario
 * @param {array} conversationHistory - Historial de mensajes anteriores
 * @returns {Promise<string>} - Respuesta del IA
 */
export async function sendMessageToDeepseek(userMessage, conversationHistory = []) {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('VITE_DEEPSEEK_API_KEY no está configurada. Verifica el archivo .env.local');
    }

    // Construir stack de mensajes para el contexto
    const messages = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://oficina-virtual-william.com',
        'X-Title': 'Oficina Virtual William'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(`OpenRouter API Error: ${errorMessage}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response received from Deepseek API');
    }

    return aiMessage;
  } catch (error) {
    console.error('Error calling Deepseek API:', error);
    throw error;
  }
}
