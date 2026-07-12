import { TagDetailPage } from "@/_pages/tag-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TagDetailPage id={id} />;
}
