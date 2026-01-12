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
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'shopping':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'cooking':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
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
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-card border-l border-border overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <h2 className="font-bold text-lg">Cooking Tasks</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 bg-background/50 border-b border-border">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">Progress</span>
            <span className="font-medium">{completedCount} / {totalCount}</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-4 overflow-x-auto border-b border-border">
          {(['all', 'shopping', 'prep', 'cooking', 'other'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === cat
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-primary/10'
              }`}
            >
              {cat === 'all' ? '📋 All' : `${getCategoryIcon(cat)} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
            </button>
          ))}
        </div>

        {/* Add new todo */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a task..."
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as TodoItem['category'])}
              className="px-2 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="shopping">🛒 Shopping</option>
              <option value="prep">🔪 Prep</option>
              <option value="cooking">🍳 Cooking</option>
              <option value="other">📝 Other</option>
            </select>
            <button
              type="submit"
              disabled={!newTodo.trim()}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto p-4">
          {Object.keys(groupedTodos).length === 0 ? (
            <div className="text-center py-8 text-muted">
              <span className="text-4xl mb-2 block">📝</span>
              <p>No tasks yet!</p>
              <p className="text-sm mt-1">Add ingredients to your shopping list from recipes</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedTodos).map(([key, items]) => (
                <div key={key}>
                  {key !== 'general' && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🍽️</span>
                      <span className="text-sm font-medium text-muted">
                        {getRecipeName(key) || 'Recipe'}
                      </span>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {items.map((todo) => (
                      <li
                        key={todo.id}
                        className={`flex items-start gap-3 p-3 rounded-lg bg-background border border-border transition-all ${
                          todo.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <button
                          onClick={() => onToggle(todo.id)}
                          className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 transition-colors ${
                            todo.completed
                              ? 'bg-primary border-primary text-white'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          {todo.completed && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-full h-full p-0.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${todo.completed ? 'line-through text-muted' : ''}`}>
                            {todo.text}
                          </p>
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full ${getCategoryColor(todo.category)}`}>
                            {getCategoryIcon(todo.category)} {todo.category}
                          </span>
                        </div>

                        <button
                          onClick={() => onDelete(todo.id)}
                          className="flex-shrink-0 p-1 text-muted hover:text-red-500 transition-colors"
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
          <div className="p-4 border-t border-border">
            <button
              onClick={onClearCompleted}
              className="w-full py-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              Clear {completedCount} completed task{completedCount !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
