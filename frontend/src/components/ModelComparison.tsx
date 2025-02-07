import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { ToggleLeft as Google, Scale as Whale, Sparkles, Timer, Send, Trophy, Flag, Scale, MessageSquare, Brain, Code } from 'lucide-react';

interface LatencyMetrics {
  ttft: number | null;
  totalTokens: number | null;
  finalLatency: number | null;
}

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

interface ModelOutput {
  messages: Message[];
  metrics: LatencyMetrics;
  isStreaming: boolean;
}

type Winner = 'google' | 'deepseek' | 'tie' | null;
type ModelType = 'reasoning' | 'instruct' | null;

const ModelComparison = () => {
  const leftChatRef = useRef<HTMLDivElement>(null);
  const rightChatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [modelType, setModelType] = useState<ModelType>(null);
  const [rightProvider] = useState<'deepseek' | 'fireworks'>('deepseek');
  const [input, setInput] = useState('');
  const [leftOutput, setLeftOutput] = useState<ModelOutput>({ 
    messages: [], 
    metrics: { ttft: null, totalTokens: null, finalLatency: null },
    isStreaming: false
  });
  const [rightOutput, setRightOutput] = useState<ModelOutput>({ 
    messages: [], 
    metrics: { ttft: null, totalTokens: null, finalLatency: null },
    isStreaming: false
  });
  const [isConversationEnded, setIsConversationEnded] = useState(false);
  const [winner, setWinner] = useState<Winner>(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (leftChatRef.current) {
      leftChatRef.current.scrollTop = leftChatRef.current.scrollHeight;
    }
    if (rightChatRef.current) {
      rightChatRef.current.scrollTop = rightChatRef.current.scrollHeight;
    }
  }, [leftOutput.messages, rightOutput.messages, leftOutput.isStreaming, rightOutput.isStreaming]);

  useEffect(() => {
    if (!leftOutput.isStreaming && !rightOutput.isStreaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [leftOutput.isStreaming, rightOutput.isStreaming]);

  const getModelNames = () => {
    if (modelType === 'reasoning') {
      return {
        google: 'Gemini 2.0 Flash Thinking',
        deepseek: 'DeepSeek R1',
        fireworks: 'Fireworks.ai'
      };
    } else {
      return {
        google: 'Gemini 2.0 Flash',
        deepseek: 'DeepSeek V3',
        fireworks: 'Fireworks.ai'
      };
    }
  };

  const calculateTokensPerSecond = (metrics: LatencyMetrics) => {
    if (metrics.totalTokens && metrics.finalLatency) {
      const tokensPerSecond = (metrics.totalTokens / (metrics.finalLatency / 1000)).toFixed(1);
      return `${tokensPerSecond} t/s`;
    }
    return '...';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim()) return;

    if (winner) {
      setFeedback(input);
      setFeedbackSubmitted(true);
      setInput('');
      return;
    }

    const userMessage: Message = { type: 'user', content: input };
    
    setLeftOutput(prev => ({ 
      messages: [...prev.messages, userMessage],
      metrics: { ttft: null, totalTokens: null, finalLatency: null }, 
      isStreaming: true 
    }));
    setRightOutput(prev => ({ 
      messages: [...prev.messages, userMessage],
      metrics: { ttft: null, totalTokens: null, finalLatency: null }, 
      isStreaming: true 
    }));

    setInput('');

    const simulateResponse = (setter: React.Dispatch<React.SetStateAction<ModelOutput>>, delay: number) => {
      const startTime = Date.now();
      const response = "Thank you for your question. Based on my analysis, there are several key points to consider. First, let's examine the context. This helps us understand the broader implications.";
      const totalTokens = response.split(' ').length; // Simplified token counting
      
      setTimeout(() => {
        setter(prev => ({
          ...prev,
          metrics: { ...prev.metrics, ttft: Date.now() - startTime }
        }));

        const assistantMessage: Message = { type: 'assistant', content: '' };
        setter(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage]
        }));

        let currentText = '';
        const words = response.split(' ');
        
        words.forEach((word, index) => {
          setTimeout(() => {
            currentText += ' ' + word;
            setter(prev => ({
              ...prev,
              messages: prev.messages.map((msg, i) => 
                i === prev.messages.length - 1 
                  ? { ...msg, content: currentText.trim() }
                  : msg
              )
            }));

            if (index === words.length - 1) {
              setter(prev => ({
                ...prev,
                metrics: { 
                  ...prev.metrics, 
                  totalTokens: totalTokens,
                  finalLatency: Date.now() - startTime 
                },
                isStreaming: false
              }));
            }
          }, (index + 1) * 100);
        });
      }, delay);
    };

    simulateResponse(setLeftOutput, 300);
    simulateResponse(setRightOutput, 500);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEndConversation = () => {
    setIsConversationEnded(true);
  };

  const handleDeclareWinner = (selectedWinner: Winner) => {
    setWinner(selectedWinner);
  };

  const MessageBubble = ({ message, isRight }: { message: Message, isRight: boolean }) => (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      {message.type === 'assistant' && (
        <img
          src={isRight ? '/images/deepseek-emblem.png' : '/images/gemini-emblem.png'}
          alt={isRight ? 'Fireworks.ai' : 'Google Gemini'}
          className="w-8 h-8 object-contain mr-2 self-start mt-1"
        />
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        message.type === 'user'
          ? 'bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white'
          : isRight
            ? 'bg-[#6B2FB3] bg-opacity-10 text-gray-800'
            : 'bg-[#4285F4] bg-opacity-10 text-gray-800'
      } ${message.type === 'assistant' ? 'shadow-sm' : ''}`}>
        {message.content}
      </div>
    </div>
  );

  const hasMessages = leftOutput.messages.length > 0 || rightOutput.messages.length > 0;
  const modelNames = getModelNames();

  if (!modelType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full space-y-8">
          <div className="flex justify-center items-center space-x-12 mb-8">
            <img 
              src="/images/googleGemini.png" 
              alt="Google Gemini" 
              className="w-80 h-80 object-contain"
            />
            <span className="text-4xl font-bold text-gray-700">VS</span>
            <img 
              src="/images/deepseek_fireworksai.png" 
              alt="Fireworks.AI" 
              className="w-80 h-80 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853]">
            Choose Model Type
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setModelType('reasoning')}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-[#4285F4]/30"
            >
              <div className="flex flex-col items-center space-y-4">
                <Brain className="w-16 h-16 text-[#4285F4]" />
                <h2 className="text-2xl font-semibold text-gray-800">Reasoning Models</h2>
                <p className="text-gray-600 text-center">
                  Compare models optimized for complex reasoning and analysis
                  <br /><br />
                  <span className="font-medium">
                    Google Gemini 2.0 Flash Thinking vs DeepSeek R1
                  </span>
                </p>
              </div>
            </button>
            <button
              onClick={() => setModelType('instruct')}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-[#4285F4]/30"
            >
              <div className="flex flex-col items-center space-y-4">
                <Code className="w-16 h-16 text-[#34A853]" />
                <h2 className="text-2xl font-semibold text-gray-800">Instruct Models</h2>
                <p className="text-gray-600 text-center">
                  Compare models optimized for following specific instructions
                  <br /><br />
                  <span className="font-medium">
                    Google Gemini 2.0 Flash vs DeepSeek V3
                  </span>
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] text-center mb-8">
          AI Model Comparison - {modelType === 'reasoning' ? 'Reasoning' : 'Instruct'} Models
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Google */}
          <div className="bg-gradient-to-br from-[#4285F4]/5 to-[#4285F4]/10 rounded-xl shadow-lg p-6 border-2 border-[#4285F4]/20 hover:border-[#4285F4]/40 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/google-logo.png"
                  alt="Google"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] bg-clip-text text-transparent">
                    Google Generative AI
                  </h2>
                  <p className="text-sm text-gray-600">{modelNames.google}</p>
                </div>
              </div>
            </div>
            
            <div 
              ref={leftChatRef}
              className="h-96 bg-gradient-to-br from-[#4285F4]/5 to-[#4285F4]/10 rounded-lg p-4 mb-4 overflow-auto relative shadow-inner border border-[#4285F4]/20 scroll-smooth scrollbar-modern"
            >
              {leftOutput.messages.map((message, index) => (
                <MessageBubble key={index} message={message} isRight={false} />
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-[#4285F4]" />
                <span>TTFT: {leftOutput.metrics.ttft ?? '...'} ms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#34A853]" />
                <span>Speed: {calculateTokensPerSecond(leftOutput.metrics)}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Fireworks.ai */}
          <div className="bg-gradient-to-br from-[#6B2FB3]/5 to-[#6B2FB3]/10 rounded-xl shadow-lg p-6 border-2 border-[#6B2FB3]/20 hover:border-[#6B2FB3]/40 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/fireworksai-logo.png"
                  alt="Fireworks.ai"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h2 className="text-xl font-semibold text-[#6B2FB3]">
                    Fireworks.ai
                  </h2>
                  <p className="text-sm text-gray-600">{modelNames.deepseek}</p>
                </div>
              </div>
            </div>
            
            <div 
              ref={rightChatRef}
              className="h-96 rounded-lg p-4 mb-4 overflow-auto relative shadow-inner border bg-gradient-to-br from-[#6B2FB3]/5 to-[#6B2FB3]/10 border-[#6B2FB3]/20 scroll-smooth scrollbar-modern"
            >
              {rightOutput.messages.map((message, index) => (
                <MessageBubble key={index} message={message} isRight={true} />
              ))}
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-[#6B2FB3]" />
                <span>TTFT: {rightOutput.metrics.ttft ?? '...'} ms</span>
              </div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#6B2FB3]" />
                <span>Speed: {calculateTokensPerSecond(rightOutput.metrics)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control Buttons and Winner Selection */}
        <div className="max-w-3xl mx-auto">
          {/* Conversation Controls */}
          {hasMessages && !isConversationEnded && (
            <div className="flex justify-center mb-4">
              <button
                onClick={handleEndConversation}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md flex items-center space-x-2"
              >
                <Trophy className="w-5 h-5" />
                <span>Rate Responses & Finish</span>
              </button>
            </div>
          )}

          {/* Winner Selection */}
          {isConversationEnded && !winner && (
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => handleDeclareWinner('google')}
                className="px-6 py-3 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:opacity-90 transition-all shadow-md flex items-center space-x-2"
              >
                <Trophy className="w-5 h-5" />
                <span>Google Wins</span>
              </button>
              <button
                onClick={() => handleDeclareWinner('tie')}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md flex items-center space-x-2"
              >
                <Scale className="w-5 h-5" />
                <span>It's a Tie</span>
              </button>
              <button
                onClick={() => handleDeclareWinner('deepseek')}
                className="px-6 py-3 bg-[#6B2FB3] text-white rounded-lg hover:opacity-90 transition-all shadow-md flex items-center space-x-2"
              >
                <Trophy className="w-5 h-5" />
                <span>Fireworks.ai Wins</span>
              </button>
            </div>
          )}

          {/* Winner Announcement */}
          {winner && (
            <div className="text-center mb-4">
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-6 h-6" />
                  <span className="text-xl font-bold">
                    {winner === 'google' && 'Google Wins! 🎉'}
                    {winner === 'deepseek' && 'Fireworks.ai Wins! 🎉'}
                    {winner === 'tie' && "It's a Tie! 🤝"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Area */}
          <div className="relative">
            {winner && !feedbackSubmitted ? (
              <form onSubmit={handleSubmit}>
                <div className="relative bg-white">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Please provide feedback on why you chose this winner..."
                    className="w-full p-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 resize-none h-32 bg-white shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={leftOutput.isStreaming || rightOutput.isStreaming}
                  />
                  <button
                    type="submit"
                    className="absolute right-4 bottom-4 p-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={leftOutput.isStreaming || rightOutput.isStreaming}
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>
                </div>
              </form>
            ) : winner && feedbackSubmitted ? (
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-inner border border-green-200">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Thank you for your feedback!</h3>
                    <p className="text-green-700">{feedback}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="relative bg-white">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your prompt here..."
                    className="w-full p-4 pr-12 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 resize-none h-32 bg-white shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={leftOutput.isStreaming || rightOutput.isStreaming}
                  />
                  {(leftOutput.isStreaming || rightOutput.isStreaming) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-[#4285F4] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#EA4335] rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-[#FBBC04] rounded-full animate-pulse delay-200"></div>
                        <div className="w-2 h-2 bg-[#34A853] rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    className="absolute right-4 bottom-4 p-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] text-white rounded-lg hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={leftOutput.isStreaming || rightOutput.isStreaming}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparison;