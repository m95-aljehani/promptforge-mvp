export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  provider: 'openai' | 'anthropic' | 'google';
  encrypted_key: string;
  created_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  user_id: string;
  folder_id?: string;
  title: string;
  body_md: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  revisions?: Revision[];
  tags?: Tag[];
}

export interface Revision {
  id: string;
  prompt_id: string;
  parent_revision_id?: string;
  body_md: string;
  command_text?: string;
  llm_provider: string;
  token_usage?: number;
  created_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color?: string;
}

export interface PromptTag {
  prompt_id: string;
  tag_id: string;
}

export interface RefineRequest {
  promptText: string;
  command?: 'enhance' | 'shorten';
  shortenLength?: number;
  provider?: 'openai' | 'anthropic' | 'google';
}

export interface RefineResponse {
  refinedText: string;
  tokensUsed: number;
  provider: string;
  requestId: string;
}