import { Modal } from "@/shared/ui/modal";
import { MeetingUploadPage } from "@/_pages/meeting-upload";

export default function InterceptedPage() {
  return (
    <Modal title="새 회의 업로드">
      <MeetingUploadPage />
    </Modal>
  );
}
