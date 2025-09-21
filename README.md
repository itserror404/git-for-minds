# Git for Minds - Decision Tracker

A simple decision management system that captures, stores, and maintains decisions as structured commits in a graph-like structure.

## Features

- **JSON Decision Storage**: Store decisions with rationale, alternatives, and assumptions
- **Decision Graph**: Branch and fork decisions when circumstances change
- **Capture Agent**: Parse natural language into structured decisions
- **Assumption Agent**: Automatically fork decisions when assumptions are violated

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Build the project:**

   ```bash
   npm run build
   ```

3. **Initialize database:**

   ```bash
   npm run init-db
   ```

4. **Start the server:**

   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## Usage

### Manual Decision Entry

1. Use the "Manual Entry" tab to create decisions with title, rationale, alternatives, and assumptions
2. View decisions in List or Tree view
3. Mark decisions as "Merged" when adopted
4. Fork decisions for reconsideration

### Text Capture

1. Switch to "Text Capture" tab
2. Enter natural language like: "Let's set pricing at $12/month to beat StartupX ($10). Alternatives are $15 or freemium."
3. The Capture Agent will parse it into a structured decision

### Assumption Monitoring

1. Use the "Check Assumptions" section
2. Enter new information like: "StartupX now costs $20/month"
3. The Assumption Agent will automatically fork affected decisions

## Example Workflow

1. **Create decision**: "Set pricing at $12/month to beat StartupX ($10)"
2. **Mark as merged**: Decision is now active
3. **New information**: "StartupX raised prices to $20/month"
4. **Automatic fork**: System creates "Reconsider: Set pricing at $12/month"
5. **Review**: Update pricing strategy based on new competitive landscape

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with better-sqlite3
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **LLM**: OpenAI API (optional, falls back to regex parsing)

## Environment Variables

```bash
OPENAI_API_KEY=your_api_key_here  # Optional - enables enhanced text parsing
```

## Project Structure

```
src/
  ├── server.ts           # Express server
  ├── database.ts         # SQLite database layer
  ├── types.ts           # TypeScript interfaces
  ├── setup-db.ts        # Database initialization
  └── agents/
      ├── capture-agent.ts    # Text-to-decision parsing
      └── assumption-agent.ts # Assumption monitoring
public/
  ├── index.html         # Frontend dashboard
  └── app.js            # Frontend JavaScript
```

## Development

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production server
