export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  conversationId?: string;
  conversationTitle?: string;
  answer?: string;
  sources?: ChatSource[];
}

export interface ChatSource {
  sectionTitle?: string;
  sourceLocation?: string;
  source?: string;
}

export interface ConversationSummary {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResponse {
  success: boolean;
  message: string;
  conversations: ConversationSummary[];
}

export interface ConversationDetailResponse {
  success: boolean;
  message: string;
  id?: string;
  title?: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
