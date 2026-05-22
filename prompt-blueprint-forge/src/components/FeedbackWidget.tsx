"use client";

import { useState } from "react";

export function FeedbackWidget({ blueprintId }: { blueprintId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setError(null);
    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprintId, rating, comment }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit feedback.");
      }
    } catch {
      setError("Network error.");
    }
  };

  if (submitted) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 text-sm">
        Thank you for your feedback!
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl border border-(--border) bg-(--card)">
      <h3 className="font-semibold text-sm mb-3">Rate this Blueprint</h3>
      <p className="text-xs text-(--muted) mb-3">
        Your feedback helps creators improve and helps other buyers find quality blueprints.
      </p>

      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-colors"
          >
            <span className={star <= (hover || rating) ? "text-amber-400" : "text-(--muted)"}>
              ★
            </span>
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-(--muted) ml-2">
            {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
          </span>
        )}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional: Share your thoughts about this blueprint..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 mb-3"
      />

      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white text-xs font-medium transition-all"
      >
        Submit Feedback
      </button>
    </div>
  );
}
