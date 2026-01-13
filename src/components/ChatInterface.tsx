'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Message, Recipe, WorldRegion, QUICK_PROMPTS } from '@/types';
import RecipeCard from './RecipeCard';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  selectedRegion: WorldRegion | 'all';
  onSaveRecipe: (recipe: Recipe) => void;
  onAddToShoppingList: (recipe: Recipe) => void;
  savedRecipeIds: string[];
  isPremium?: boolean;
  onShowPaywall?: () => void;
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  selectedRegion,
  onSaveRecipe,
  onAddToShoppingList,
  savedRecipeIds,
  isPremium = false,
  onShowPaywall,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await onSendMessage(message);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Voice input handler
  const handleVoiceInput = useCallback(() => {
    // If not premium, show paywall
    if (!isPremium) {
      onShowPaywall?.();
      return;
    }

    if (!speechSupported) {
      alert('Voice input is not supported in your browser');
      return;
    }

    if (isListening) {
      // Stop listening
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // Start listening
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isPremium, speechSupported, isListening, onShowPaywall]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="mb-4">
              <Image
                src="/images/logo.png"
                alt="RecipePilot"
                width={80}
                height={80}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Welcome to RecipePilot!
            </h2>
            <p className="text-muted mb-6 max-w-md">
              Your AI-powered culinary companion. Ask me for recipes from around the world,
              ingredient substitutions, cooking techniques, or meal planning!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-left p-4 rounded-xl bg-gradient-to-br from-card to-background border border-border hover:border-amber-400/50 hover:shadow-md hover:shadow-amber-500/10 transition-all text-sm group"
                >
                  <span className="group-hover:text-amber-600 transition-colors">{prompt}</span>
                </button>
              ))}
            </div>

            {isPremium && (
              <div className="mt-6 flex items-center gap-2 text-amber-600 text-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-medium">Premium Member</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' ? 'message-user' : 'message-assistant'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                      <Image
                        src="/images/logo.png"
                        alt="RecipePilot"
                        width={24}
                        height={24}
                        className="rounded-md"
                      />
                      <span className="font-medium text-sm text-amber-700">RecipePilot</span>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>

                  {message.recipe && (
                    <div className="mt-4">
                      <RecipeCard
                        recipe={message.recipe}
                        onSave={onSaveRecipe}
                        onAddToShoppingList={onAddToShoppingList}
                        isSaved={savedRecipeIds.includes(message.recipe.id)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="message-assistant max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                    <Image
                      src="/images/logo.png"
                      alt="RecipePilot"
                      width={24}
                      height={24}
                      className="rounded-md"
                    />
                    <span className="font-medium text-sm text-amber-700">RecipePilot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm text-muted">Cooking up something delicious...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-card p-4">
        {selectedRegion !== 'all' && (
          <div className="text-xs text-muted mb-2 flex items-center gap-1">
            <span>🎯</span>
            <span>Focused on {selectedRegion.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} cuisine</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me for a recipe, cooking tips, or ingredient suggestions..."
            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 resize-none text-sm transition-all"
            rows={1}
            disabled={isLoading}
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`px-4 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : isPremium
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
            }`}
            title={isPremium ? (isListening ? 'Stop recording' : 'Voice input') : 'Premium feature - Upgrade to use voice'}
          >
            {isListening ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            )}
            {!isPremium && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-amber-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>

        {/* Listening indicator */}
        {isListening && (
          <div className="mt-2 text-center text-sm text-red-500 animate-pulse flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Listening... Speak now
          </div>
        )}
      </div>
    </div>
  );
}
