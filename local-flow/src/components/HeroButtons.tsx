"use client";

import { useState } from "react";
import Link from "next/link";
import ChecklistModal from "./ChecklistModal";

export default function HeroButtons() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/guides"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-4 text-base font-semibold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
        >
          Browse Automation Guides →
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors"
        >
          Download Free Checklist
        </button>
      </div>
      {showModal && <ChecklistModal onClose={() => setShowModal(false)} />}
    </>
  );
}
