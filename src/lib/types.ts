export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface KnowledgeResponse {
  tag: "searching" | "seeds" | "final";
  content: any;
}

export interface KnowledgeSeed {
  id: string;
  tokens: number;
  content: string;
  order: number;
  source_id: string;
  source_title: string;
  nip: number;
}

export interface ConversationSession {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  response: string;
  seeds: any[];
  searching: boolean;
}
