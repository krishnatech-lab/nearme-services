import React from 'react';
import { History, X, Trash2, ArrowUpRight, Clock } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onSelectSearch: (query: string) => void;
  onRemoveSearch: (query: string) => void;
  onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelectSearch,
  onRemoveSearch,
  onClearAll,
}) => {
  if (!searches || searches.length === 0) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs p-3 sm:p-4 my-2.5 transition-all">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            Your Recent Searches ({searches.length}/5)
          </span>
        </div>

        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
          title="Clear all recent searches"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {searches.map((query, idx) => (
          <div
            key={`${query}-${idx}`}
            className="group flex items-center bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-3 py-1.5 transition-all shadow-2xs"
          >
            <button
              onClick={() => onSelectSearch(query)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 group-hover:text-blue-700 cursor-pointer"
              title={`Search for "${query}"`}
            >
              <History className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
              <span>{query}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveSearch(query);
              }}
              className="ml-2 p-0.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
              title="Remove this search"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
