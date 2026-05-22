"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { searchTools, type Tool } from "@/lib/content";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    if (value.length >= 2) {
      setResults(searchTools(value));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search tools, guides, categories..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${tool.slug}`}
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-xs">
                {tool.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{tool.name}</p>
                <p className="text-xs text-gray-500 truncate">{tool.tagline}</p>
              </div>
              <span className="text-xs text-gray-400 capitalize">{tool.difficulty}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
