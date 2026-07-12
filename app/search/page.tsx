import { SearchPage } from "@/_pages/search";

export default function Page() {
  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-page-h1 font-bold text-ink">검색</h1>
        <SearchPage />
      </div>
    </main>
  );
}
