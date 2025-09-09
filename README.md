# PromptForge MVP

A web-first, cross-platform-ready prototype for creating, managing, and refining AI prompts with intelligent enhancements.

## Features

- **Markdown Prompt Editor**: Rich text editing with TipTap
- **AI Refinement**: One-tap prompt enhancement and shortening
- **Local Storage**: IndexedDB for offline functionality
- **Cloud Sync**: Optional Supabase integration
- **Organization**: Folders, tags, and pinning
- **Security**: Encrypted API key storage
- **Slash Commands**: `/enhance` and `/shorten N` support

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Editor**: TipTap (Markdown)
- **Backend**: Supabase (Auth + Database)
- **Serverless**: Vercel Functions
- **Storage**: IndexedDB + PostgreSQL
- **Deployment**: Vercel

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/m95-aljehani/promptforge-mvp.git
   cd promptforge-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## Environment Setup

### Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Run the database migrations (see `supabase/migrations/`)

### Database Schema

```sql
-- Users table (handled by Supabase Auth)
-- Additional tables:

CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  parent_revision_id UUID REFERENCES revisions(id),
  body_md TEXT NOT NULL,
  command_text TEXT,
  llm_provider TEXT NOT NULL,
  token_usage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT
);

CREATE TABLE prompt_tags (
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (prompt_id, tag_id)
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage

### Creating Prompts

1. Click "New Prompt" in the sidebar
2. Enter a title and write your prompt in Markdown
3. Save with Ctrl+Enter or the Save button

### AI Refinement

1. Open an existing prompt
2. Click "Refine" button or use slash commands:
   - `/enhance` - Improve prompt clarity and effectiveness
   - `/shorten 100` - Reduce prompt to specified character count

### Organization

- **Folders**: Create folders to organize prompts by category
- **Tags**: Add colored tags for flexible categorization
- **Pinning**: Pin important prompts for quick access
- **Search**: Use the search bar to find prompts by title or content

### Offline Usage

The app works offline using IndexedDB for local storage. Data syncs automatically when online.

## API Endpoints

### POST /api/refine

Refine a prompt using AI.

**Request:**
```json
{
  "promptText": "Your prompt text here",
  "command": "enhance", // or "shorten"
  "shortenLength": 100, // optional, for shorten command
  "provider": "openai", // optional
  "apiKey": "your-api-key" // optional
}
```

**Response:**
```json
{
  "refinedText": "Enhanced prompt text",
  "tokensUsed": 150,
  "provider": "openai",
  "requestId": "req_123456789"
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run E2E tests

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── PromptEditor.tsx # TipTap editor
│   └── ...
├── contexts/           # React contexts
├── lib/               # Utilities and configurations
├── types/             # TypeScript type definitions
└── main.tsx          # App entry point

api/
└── refine.ts         # Vercel serverless function
```

## Deployment

### Vercel Deployment

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables in Vercel dashboard**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ENCRYPTION_KEY`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder to your hosting provider**

## Security

- API keys are encrypted using AES-256 before storage
- All database operations use Row Level Security (RLS)
- No raw API keys are logged or exposed in responses
- Client-side encryption for sensitive data

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

Test coverage includes:
- Prompt creation and editing
- AI refinement workflow
- Local storage persistence
- Authentication flow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

### Phase 2 Features
- Real-time collaboration
- Advanced AI provider integrations
- Desktop app (Tauri)
- Mobile app (React Native)
- Advanced analytics
- Team workspaces
- Template library

### Known Limitations
- Minimum 1-hour scheduling for recurring tasks
- Mock AI responses in development
- Basic conflict resolution for sync

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review existing issues for solutions