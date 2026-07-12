import { MeetingDetailPage } from "@/_pages/meeting-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MeetingDetailPage id={id} />;
}
