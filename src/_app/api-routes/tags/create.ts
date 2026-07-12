import { z } from "zod";
import { NextResponse } from "next/server";
import { createTag } from "@/shared/db/queries/tags";

const createSchema = z
  .object({
    name: z.string().min(1),
    contextTemplate: z.string().min(1),
  })
  .strict();

export async function postTag(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "이름과 배경 컨텍스트를 모두 입력해주세요." },
      { status: 400 },
    );
  }

  const id = await createTag(parsed.data.name, parsed.data.contextTemplate);
  return NextResponse.json({ id });
}
