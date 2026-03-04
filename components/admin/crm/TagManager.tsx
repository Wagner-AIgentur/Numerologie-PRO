'use client';

import { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface Props {
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

const SUGGESTED_TAGS = [
  'VIP', 'Newsletter', 'PDF-Käufer', 'Beratung-gebucht',
  'Empfehlung', 'Wartet-auf-Antwort', 'Kalt', 'Stammkunde',
];

export default function TagManager({ tags, onUpdate }: Props) {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onUpdate([...tags, trimmed]);
    setInput('');
    setShowSuggestions(false);
  }

  function removeTag(tag: string) {
    onUpdate(tags.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
  }

  const filteredSuggestions = SUGGESTED_TAGS.filter(
    (s) => !tags.includes(s) && s.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div>
      {/* Existing Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.length === 0 && (
          <span className="text-xs text-white/30 italic">Keine Tags</span>
        )}
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gold/10 text-gold/80 border border-gold/20"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-red-400 transition-colors"
            >
              <X className="h-3 w-3" strokeWidth={2} />
            </button>
          </span>
        ))}
      </div>

      {/* Add Tag */}
      <div className="relative">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Tag hinzufügen..."
            className="flex-1 text-xs text-white/70 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gold/30"
          />
          <button
            onClick={() => addTag(input)}
            disabled={!input.trim()}
            className="p-1.5 text-white/30 hover:text-gold disabled:opacity-30 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 top-full mt-1 w-full bg-[#0d2d42] border border-white/10 rounded-lg overflow-hidden shadow-xl">
            {filteredSuggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => addTag(s)}
                className="block w-full text-left text-xs text-white/60 hover:text-white hover:bg-white/5 px-3 py-2 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
