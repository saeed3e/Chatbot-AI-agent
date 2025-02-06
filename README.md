# Chatbot AI Agent

A modern React TypeScript application that implements an AI-powered chatbot using OpenAI's API. Built with Vite, React, TypeScript, and TailwindCSS for a responsive and user-friendly interface.

[![Edit in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/~/github.com/saeed3e/Chatbot-AI-agent)

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/saeed3e/Chatbot-AI-agent.git
   cd Chatbot-AI-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your OpenAI API key:
     ```
     VITE_OPENAI_API_KEY=your_api_key_here
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

### 🐳 Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t chatbot-ai-agent .
   ```

2. **Run the container**
   ```bash
   docker run -p 8080:80 chatbot-ai-agent
   ```
   The application will be available at `http://localhost:8080`

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **AI Integration**: OpenAI API
- **Icons**: Lucide React
- **Development Tools**:
  - ESLint for code linting
  - PostCSS for CSS processing
  - TypeScript for type safety

## 📦 Project Structure

```
chatbot-ai-agent/
├── src/               # Source files
├── public/           # Static assets
├── index.html        # Entry HTML file
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
├── package.json      # Project dependencies
└── Dockerfile        # Docker configuration
```

## 🔑 Environment Variables

The following environment variables are required:

- `VITE_OPENAI_API_KEY`: Your OpenAI API key

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).