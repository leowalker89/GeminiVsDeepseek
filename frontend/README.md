# AI Model Comparison Frontend

A modern, interactive web application for comparing AI model responses in real-time. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Model Selection**: Choose between reasoning and instruction-optimized models
- **Real-time Comparison**: Side-by-side comparison of responses from different AI models
- **Performance Metrics**: Track and display TTFT (Time to First Token) and token generation speed
- **Interactive UI**: Beautiful, responsive design with smooth animations and transitions
- **Feedback System**: Rate responses and provide detailed feedback on model performance

## Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development and optimized builds

## Project Structure

```
/
├── public/
│   └── images/          # Static images for logos and emblems
├── src/
│   ├── components/      # React components
│   │   └── ModelComparison.tsx  # Main comparison interface
│   ├── App.tsx         # Root application component
│   ├── main.tsx        # Application entry point
│   └── index.css       # Global styles and Tailwind imports
├── package.json        # Dependencies and scripts
└── vite.config.ts     # Vite configuration
```

## Key Components

### ModelComparison

The core component (`src/components/ModelComparison.tsx`) handles:

1. **State Management**:
   - Model selection (reasoning vs. instruct)
   - Chat messages and streaming state
   - Performance metrics tracking
   - Winner selection and feedback

2. **UI Features**:
   - Split-screen chat interface
   - Real-time response streaming
   - Performance metrics display
   - Interactive feedback system

3. **User Interactions**:
   - Model type selection
   - Message input and submission
   - Response rating
   - Feedback submission

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Development

- Uses ESLint for code quality
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for development and building