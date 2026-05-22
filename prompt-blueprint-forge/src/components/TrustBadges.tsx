export function TrustBadges({ variant = "default" }: { variant?: "default" | "compact" }) {
  const badges = [
    { icon: "🔒", label: "Secure Checkout", desc: "SSL-encrypted payments" },
    { icon: "🛡️", label: "Money-Back Guarantee", desc: "30-day satisfaction guarantee" },
    { icon: "⚡", label: "Instant Access", desc: "Download immediately after purchase" },
    { icon: "💳", label: "Secure Payments", desc: "Powered by Stripe" },
  ];

  const compactBadges = [
    { icon: "🔒", label: "SSL Secure" },
    { icon: "🛡️", label: "30-Day Guarantee" },
    { icon: "⚡", label: "Instant Access" },
  ];

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-(--muted)">
        {compactBadges.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1">
            <span>{b.icon}</span>
            <span>{b.label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {badges.map((b) => (
        <div key={b.label} className="flex items-start gap-3 p-3 rounded-xl border border-(--border) bg-(--card)">
          <span className="text-lg mt-0.5">{b.icon}</span>
          <div>
            <p className="text-sm font-medium">{b.label}</p>
            <p className="text-xs text-(--muted)">{b.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
