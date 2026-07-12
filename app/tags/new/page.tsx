import { TagCreatePage } from "@/_pages/tag-create";

export default function Page() {
  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-page-h1 font-bold text-ink">새 프로젝트 태그</h1>
        <TagCreatePage />
      </div>
    </main>
  );
}
