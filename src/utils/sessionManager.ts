const SESSION_KEY = 'golge_session_id';
const MESSAGES_KEY = 'golge_messages';

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

export const getSessionId = (): string => {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
};

export const resetSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(MESSAGES_KEY);
  window.location.reload();
};

export const saveMessages = (messages: unknown[]): void => {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
};

export const loadMessages = (): unknown[] => {
  const stored = localStorage.getItem(MESSAGES_KEY);
  return stored ? JSON.parse(stored) : [];
};
