// Conversation persistence client for the GlobalHealth AI Assistant.
//
// BACKEND CONTRACT (documented in docs/ai-assistant-backend-contract.md):
//   - The server identifies the user from its own secure session (Bearer
//     token). The client NEVER sends a userId.
//   - Every persistent request validates `authenticatedUser.id ===
//     conversation.userId` before reading or mutating anything.
//   - Anonymous conversations are session-only (React state) and are never
//     sent to these endpoints unless the user explicitly chooses to save the
//     conversation to their account after signing in.
import { apiFetch, AuthError } from '../../services/authClient';
import type { AIConversation, AIConversationSummary, AIMessage } from './types';

export interface CreateConversationInput {
  title?: string;
  /** Explicit opt-in payload: when a guest logs in and chooses
   * "Save this conversation to my account", these session-only messages are
   * copied to a new owned conversation. */
  messages?: AIMessage[];
}

/** Wrapper so callers can distinguish expected failures (network/401) from bugs. */
export class AIConversationError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

function toError(err: unknown): AIConversationError {
  if (err instanceof AuthError) {
    if (err.code === 'AUTH_REQUIRED' || err.code === 'SESSION_EXPIRED') return new AIConversationError(err.message, 'AUTH_REQUIRED');
    return new AIConversationError(err.message, err.code);
  }
  if (err instanceof AIConversationError) return err;
  return new AIConversationError('Network connection failed. Please check your connection and try again.', 'NETWORK_ERROR');
}

export async function listConversations(): Promise<AIConversationSummary[]> {
  try {
    const data = await apiFetch<{ success: boolean; conversations: AIConversationSummary[] }>('/api/ai/conversations');
    return data.conversations || [];
  } catch (err) {
    throw toError(err);
  }
}

export async function createConversation(input: CreateConversationInput = {}): Promise<AIConversation> {
  try {
    const data = await apiFetch<{ success: boolean; conversation: AIConversation }>('/api/ai/conversations', {
      method: 'POST',
      body: { title: input.title, messages: input.messages },
    });
    return data.conversation;
  } catch (err) {
    throw toError(err);
  }
}

export async function getConversation(id: string): Promise<AIConversation> {
  try {
    const data = await apiFetch<{ success: boolean; conversation: AIConversation }>(`/api/ai/conversations/${encodeURIComponent(id)}`);
    return data.conversation;
  } catch (err) {
    throw toError(err);
  }
}

export async function renameConversation(id: string, title: string): Promise<AIConversationSummary> {
  try {
    const data = await apiFetch<{ success: boolean; conversation: AIConversationSummary }>(`/api/ai/conversations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: { title },
    });
    return data.conversation;
  } catch (err) {
    throw toError(err);
  }
}

export async function deleteConversation(id: string): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>(`/api/ai/conversations/${encodeURIComponent(id)}`, { method: 'DELETE' });
  } catch (err) {
    throw toError(err);
  }
}

export async function deleteAllConversations(): Promise<void> {
  try {
    await apiFetch<{ success: boolean }>('/api/ai/conversations', { method: 'DELETE' });
  } catch (err) {
    throw toError(err);
  }
}

export async function appendMessage(conversationId: string, message: AIMessage): Promise<AIMessage> {
  try {
    const data = await apiFetch<{ success: boolean; message: AIMessage }>(
      `/api/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
      { method: 'POST', body: { role: message.role, content: message.content } }
    );
    return data.message;
  } catch (err) {
    throw toError(err);
  }
}

export interface AssistantRequestContext {
  displayName?: string;
  mrn?: string;
  authenticated: boolean;
}

/** Calls the Gemini-backed assistant endpoint with the signed-in caller's own
 * basic identity only (never any other account or the demo patient's data). */
export async function requestAssistantResponse(
  prompt: string,
  language: string,
  userContext: AssistantRequestContext,
  signal?: AbortSignal
): Promise<string> {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 45000);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort);
  try {
    const res = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language, userContext }),
      signal: controller.signal,
    });
    if (!res.ok) {
      // The server reports a clean JSON error (e.g. missing API key). The
      // user-facing copy is always friendly — never a raw server error.
      let body: { error?: unknown } = {};
      try {
        body = await res.json();
      } catch {
        /* non-JSON error body */
      }
      const serverMsg = typeof body?.error === 'string' ? body.error : '';
      const message = serverMsg && serverMsg.includes('GEMINI_API_KEY')
        ? 'The AI service is not configured on this server yet. Please try again later.'
        : 'The AI service is temporarily unavailable. Please try again shortly.';
      throw new AIConversationError(message, 'AI_UNAVAILABLE');
    }
    const data = await res.json();
    const text = typeof data?.response === 'string' && data.response.trim() ? data.response : null;
    if (!text) throw new AIConversationError('The AI service returned an empty response. Please try again.', 'AI_EMPTY');
    return text;
  } catch (err) {
    if (timedOut) {
      throw new AIConversationError('The AI service took too long to respond. Please try again.', 'AI_TIMEOUT');
    }
    if (controller.signal.aborted || signal?.aborted) {
      throw new AIConversationError('Response stopped.', 'AI_STOPPED');
    }
    if (err instanceof AIConversationError) throw err;
    throw new AIConversationError('Network connection failed. Please check your connection and try again.', 'NETWORK_ERROR');
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}

export { AuthError };
