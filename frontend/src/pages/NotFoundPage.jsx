import { ButtonLink } from '../components/ui/Button.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Window from '../components/ui/Window.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('페이지 없음');
  return (
    <div className="grid min-h-dvh place-items-center px-3">
      <Window title="DearDays" icon={<PixelIcon name="warning" size={14} />} className="w-full max-w-md" collapsible={false} maximizable={false}>
        <div className="flex items-start gap-4">
          <PixelIcon name="warning" size={32} />
          <div>
            <p>찾는 페이지가 없어요.</p>
            <p className="font-small mt-1 text-[12px] text-muted">주소가 바뀌었거나 삭제된 페이지예요.</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <ButtonLink to="/" variant="default">
            홈으로
          </ButtonLink>
        </div>
      </Window>
    </div>
  );
}
