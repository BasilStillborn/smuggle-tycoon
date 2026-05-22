export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs sm:text-sm text-center py-2 px-4">
      <span className="font-medium">🎉 New:</span> Create your first prompt blueprint and start earning 80% per sale.{" "}
      <a href="/create" className="underline font-medium hover:no-underline whitespace-nowrap">
        Start Selling &rarr;
      </a>
    </div>
  );
}
