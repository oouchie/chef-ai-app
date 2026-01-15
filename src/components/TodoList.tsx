'use client';

import { useState } from 'react';
import { TodoItem, Recipe } from '@/types';

interface TodoListProps {
  todos: TodoItem[];
  savedRecipes: Recipe[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string, category: TodoItem['category']) => void;
  onClearCompleted: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TodoList({
  todos,
  savedRecipes,
  onToggle,
  onDelete,
  onAdd,
  onClearCompleted,
  isOpen,
  onClose,
}: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');
  const [newCategory, setNewCategory] = useState<TodoItem['category']>('other');
  const [filter, setFilter] = useState<'all' | TodoItem['category']>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo.trim(), newCategory);
      setNewTodo('');
    }
  };

  const filteredTodos = filter === 'all'
    ? todos
    : todos.filter((t) => t.category === filter);

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  const getCategoryIcon = (category: TodoItem['category']) => {
    switch (category) {
      case 'prep':
        return '🔪';
      case 'shopping':
        return '🛒';
      case 'cooking':
        return '🍳';
      default:
        return '📝';
    }
  };

  const getCategoryColor = (category: TodoItem['category']) => {
    switch (category) {
      case 'prep':
        return 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 border border-blue-500/20';
      case 'shopping':
        return 'bg-gradient-to-r from-secondary/10 to-teal-500/10 text-secondary border border-secondary/20';
      case 'cooking':
        return 'bg-gradient-to-r from-primary/10 to-accent/10 text-primary border border-primary/20';
      default:
        return 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 text-muted border border-gray-500/20';
    }
  };

  const getRecipeName = (recipeId?: string) => {
    if (!recipeId) return null;
    const recipe = savedRecipes.find((r) => r.id === recipeId);
    return recipe?.name;
  };

  // Group todos by recipe
  const groupedTodos = filteredTodos.reduce((acc, todo) => {
    const key = todo.recipeId || 'general';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(todo);
    return acc;
  }, {} as Record<string, TodoItem[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full glass-strong border-l border-white/20 overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-secondary/5 to-teal-500/5">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-teal-500 flex items-center justify-center shadow-md shadow-secondary/20 text-lg">
              ✅
            </span>
            <div>
              <h2 className="font-bold text-lg">Cooking Tasks</h2>
              <p className="text-xs text-muted">{totalCount} task{totalCount !== 1 ? 's' : ''} total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 btn-glass rounded-xl hover:shadow-glow-secondary transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 py-4 bg-gradient-to-r from-background/50 via-transparent to-background/50 border-b border-white/10">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted font-medium">Progress</span>
            <span className="font-bold bg-gradient-to-r from-secondary to-teal-500 bg-clip-text text-transparent">{completedCount} / {totalCount}</span>
          </div>
          <div className="h-3 bg-background/80 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-secondary to-teal-500 transition-all duration-500 rounded-full shadow-md shadow-secondary/30"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-4 overflow-x-auto border-b border-white/10 scrollbar-hide">
          {(['all', 'shopping', 'prep', 'cooking', 'other'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === cat
                  ? 'btn-gradient-secondary shadow-glow-secondary'
                  : 'btn-glass hover:shadow-sm'
              }`}
            >
              {cat === 'all' ? '📋 All' : `${getCategoryIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Add new todo */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-white/10">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 px-4 py-3 text-sm glass border border-white/30 rounded-xl focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as TodoItem['category'])}
              className="px-3 py-3 text-sm font-medium glass border border-white/30 rounded-xl focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all"
            >
              <option value="shopping">🛒</option>
              <option value="prep">🔪</option>
              <option value="cooking">🍳</option>
              <option value="other">📝</option>
            </select>
            <button
              type="submit"
              disabled={!newTodo.trim()}
              className="px-5 py-3 btn-gradient-secondary rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-glow-secondary transition-all"
            >
              Add
            </button>
          </div>
        </form>

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.keys(groupedTodos).length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-secondary/10 to-teal-500/10 flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <p className="font-semibold">No tasks yet!</p>
              <p className="text-sm text-muted mt-2">Add ingredients to your shopping list from recipes</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTodos).map(([key, items]) => (
                <div key={key} className="animate-fade-in">
                  {key !== 'general' && (
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-sm">🍽️</span>
                      <span className="text-sm font-semibold">
                        {getRecipeName(key) || 'Recipe'}
                      </span>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {items.map((todo) => (
                      <li
                        key={todo.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl glass-card transition-all ${
                          todo.completed ? 'opacity-50' : ''
                        }`}
                      >
                        <button
                          onClick={() => onToggle(todo.id)}
                          className={`flex-shrink-0 w-6 h-6 mt-0.5 rounded-lg border-2 transition-all flex items-center justify-center ${
                            todo.completed
                              ? 'bg-gradient-to-br from-secondary to-teal-500 border-transparent shadow-md shadow-secondary/20'
                              : 'border-border hover:border-secondary hover:shadow-sm'
                          }`}
                        >
                          {todo.completed && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${todo.completed ? 'line-through text-muted' : ''}`}>
                            {todo.text}
                          </p>
                          <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-lg font-medium ${getCategoryColor(todo.category)}`}>
                            {getCategoryIcon(todo.category)} {todo.category}
                          </span>
                        </div>

                        <button
                          onClick={() => onDelete(todo.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {completedCount > 0 && (
          <div className="p-4 border-t border-white/10 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5">
            <button
              onClick={onClearCompleted}
              className="w-full py-3 text-sm font-medium text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              Clear {completedCount} completed task{completedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
