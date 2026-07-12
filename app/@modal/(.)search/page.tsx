import { Modal } from "@/shared/ui/modal";
import { SearchPage } from "@/_pages/search";

export default function InterceptedPage() {
  return (
    <Modal title="검색">
      <SearchPage />
    </Modal>
  );
}
