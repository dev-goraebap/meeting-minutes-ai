import { MeetingUploadPage } from "@/_pages/meeting-upload";

export default function Page() {
  return (
    <main className="min-h-screen bg-page px-6 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 text-page-h1 font-bold text-ink">새 회의 업로드</h1>
        <MeetingUploadPage />
      </div>
    </main>
  );
}
