import { Modal } from "@/shared/ui/modal";
import { TagCreatePage } from "@/_pages/tag-create";

export default function InterceptedPage() {
  return (
    <Modal title="새 프로젝트 태그">
      <TagCreatePage />
    </Modal>
  );
}
