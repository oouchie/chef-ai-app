'use client';

import { useState, useRef, useEffect } from 'react';
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
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading,
  selectedRegion,
  onSaveRecipe,
  onAddToShoppingList,
  savedRecipeIds,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <span className="text-6xl mb-4">👨‍🍳</span>
            <h2 className="text-2xl font-bold mb-2">Welcome to Chef AI!</h2>
            <p className="text-muted mb-6 max-w-md">
              I'm your personal culinary assistant. Ask me for recipes from around the world,
              help with ingredient substitutions, cooking techniques, or meal planning!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {QUICK_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-left p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
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
                      <span className="text-xl">👨‍🍳</span>
                      <span className="font-medium text-sm">Chef AI</span>
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
                    <span className="text-xl">👨‍🍳</span>
                    <span className="font-medium text-sm">Chef AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm text-muted">Finding the perfect recipe...</span>
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
            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none resize-none text-sm"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
