import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlueprintById, getBlueprintAuthor, getBlueprintCategory, formatPrice, formatDate, formatSalesCount } from "@/lib/data";
import { RatingStars } from "@/components/RatingStars";
import { AddToCartButton } from "./AddToCartButton";
import { TrustBadges } from "@/components/TrustBadges";
import { SocialShare } from "@/components/SocialShare";
import { FeedbackWidget } from "@/components/FeedbackWidget";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const blueprint = getBlueprintById(id);
  if (!blueprint) return { title: "Blueprint Not Found" };
  return {
    title: blueprint.title,
    description: blueprint.description.slice(0, 160),
      openGraph: {
        title: `${blueprint.title} - ${formatPrice(blueprint.price)}`,
        description: blueprint.description.slice(0, 160),
        type: "website",
      },
  };
}

export default async function BlueprintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const blueprint = getBlueprintById(id);

  if (!blueprint) {
    notFound();
  }

  const author = getBlueprintAuthor(blueprint);
  const category = getBlueprintCategory(blueprint);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: blueprint.title,
    description: blueprint.description,
    image: blueprint.image,
    offers: {
      "@type": "Offer",
      price: blueprint.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: blueprint.rating,
      reviewCount: blueprint.reviewCount,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1 text-sm text-(--muted) hover:text-(--foreground) transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-6">
            <img
              src={blueprint.image}
              alt={blueprint.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            {blueprint.featured && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-indigo-500/80 backdrop-blur-sm text-white text-xs font-medium">
                Featured Blueprint
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{blueprint.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <RatingStars rating={blueprint.rating} size="md" />
              <span className="text-sm font-medium">{blueprint.rating}</span>
              <span className="text-sm text-(--muted)">({blueprint.reviewCount} reviews)</span>
            </div>
            <span className="text-(--muted)">•</span>
            <span className="text-sm text-(--muted)">{formatSalesCount(blueprint.sales)} sold</span>
            <span className="text-(--muted)">•</span>
            <span className={`text-xs font-medium px-2 py-1 rounded-md ${
              blueprint.difficulty === "beginner" ? "bg-green-500/10 text-green-400" :
              blueprint.difficulty === "intermediate" ? "bg-amber-500/10 text-amber-400" :
              "bg-red-500/10 text-red-400"
            }`}>
              {blueprint.difficulty}
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-(--muted) mb-8">
            <div className="p-4 rounded-xl bg-(--card-hover) border border-(--border) mb-6">
              <p className="text-(--foreground) leading-relaxed">{blueprint.longDescription}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4">What&apos;s Included</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blueprint.includes.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-(--border) bg-(--card)"
                >
                  <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4">Compatible Models</h3>
            <div className="flex flex-wrap gap-2">
              {blueprint.compatibleModels.map((model) => (
                <span
                  key={model}
                  className="px-3 py-1.5 rounded-lg border border-(--border) text-sm text-(--muted)"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {blueprint.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full bg-indigo-500/5 text-indigo-400 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
              <div className="text-3xl font-bold gradient-text mb-6">
                {formatPrice(blueprint.price)}
              </div>

              <AddToCartButton blueprintId={blueprint.id} />

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-(--muted)">Steps</span>
                  <span className="font-medium">{blueprint.steps}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-(--muted)">Token Budget</span>
                  <span className="font-medium">~{blueprint.tokens.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-(--muted)">Updated</span>
                  <span className="font-medium">{formatDate(blueprint.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-(--muted)">Created</span>
                  <span className="font-medium">{formatDate(blueprint.createdAt)}</span>
                </div>
              </div>
            </div>

            {author && (
              <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
                <h3 className="font-semibold mb-4">Creator</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {author.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{author.name}</div>
                    <div className="text-xs text-(--muted)">Joined {formatDate(author.joinedDate)}</div>
                  </div>
                </div>
              </div>
            )}

            {category && (
              <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-sm`}>
                    {category.icon}
                  </div>
                  <span className="text-sm">{category.name}</span>
                </div>
              </div>
            )}

            <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
              <h3 className="font-semibold mb-4">Purchase Safely</h3>
              <TrustBadges variant="compact" />
            </div>

            <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
              <SocialShare title={blueprint.title} />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-8">
        <FeedbackWidget blueprintId={blueprint.id} />
      </div>
    </div>
  );
}
