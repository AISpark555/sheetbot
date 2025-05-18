import { encode } from 'gpt-tokenizer';

// Estimate token count for OpenAI-compatible models
export function calculateTokenCount(text: string): number {
  if (!text) return 0;
  
  // Use gpt-tokenizer to calculate tokens (compatible with OpenAI's tokenizer)
  try {
    // Default to using the gpt-3.5-turbo encoder
    const tokens = encode(text);
    return tokens.length;
  } catch (error) {
    // Fallback method: rough approximation
    // ~4 chars per token for English text
    return Math.ceil(text.length / 4);
  }
}