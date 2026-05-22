import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-gray-500">
        <li>
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex items-center gap-2">
            <svg className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" />
            </svg>
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-brand-600 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
