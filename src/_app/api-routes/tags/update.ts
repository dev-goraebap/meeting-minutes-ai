import { z } from "zod";
import { NextResponse } from "next/server";
import { getTagById, updateTagFields } from "@/shared/db/queries/tags";

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    contextTemplate: z.string().optional(),
  })
  .strict();

export async function patchTag(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const tag = await getTagById(id);
  if (!tag) {
    return NextResponse.json({ error: "태그를 찾을 수 없어요." }, { status: 404 });
  }

  const json = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않아요.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await updateTagFields(id, parsed.data);
  return NextResponse.json({ ok: true });
}
