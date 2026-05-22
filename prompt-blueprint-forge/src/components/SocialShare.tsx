"use client";

import { useState } from "react";

export function SocialShare({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);
  const href = url || (typeof window !== "undefined" ? window.location.href : "");
  const text = encodeURIComponent(`${title} - Prompt Blueprint Forge`);
  const encodedUrl = encodeURIComponent(href);

  const shareLinks = [
    { name: "Twitter", href: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, icon: "𝕏" },
    { name: "LinkedIn", href: `https://linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: "in" },
    { name: "Copy", href: "#", icon: "🔗" },
  ];

  const handleClick = (e: React.MouseEvent, link: typeof shareLinks[0]) => {
    if (link.name === "Copy") {
      e.preventDefault();
      navigator.clipboard.writeText(href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }
    window.open(link.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-(--muted)">Share:</span>
      {shareLinks.map((link) => (
        <button
          key={link.name}
          onClick={(e) => handleClick(e, link)}
          className="w-7 h-7 rounded-lg border border-(--border) bg-(--card) hover:bg-(--card-hover) text-xs font-medium flex items-center justify-center transition-all"
          title={copied && link.name === "Copy" ? "Copied!" : `Share on ${link.name}`}
        >
          {copied && link.name === "Copy" ? "✓" : link.icon}
        </button>
      ))}
    </div>
  );
}
