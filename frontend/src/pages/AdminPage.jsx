import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import AdminInquiryPanel from '../components/admin/AdminInquiryPanel.jsx';
import AdminTopicManager from '../components/topic/AdminTopicManager.jsx';
import AdminUnlockDialog from '../components/topic/AdminUnlockDialog.jsx';
import Button from '../components/ui/Button.jsx';
import { EmptyState, ErrorMessage, Loading } from '../components/ui/Feedback.jsx';
import PixelIcon from '../components/ui/PixelIcon.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Window from '../components/ui/Window.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFetch } from '../hooks/useFetch.js';
import { adminService } from '../services/adminService.js';
import { getErrorMessage } from '../utils/errors.js';

const TABS = ['topics', 'inquiries'];

/**
 * 관리자 화면 (/admin): 서버의 관리자 비밀번호를 넣은 계정만 쓴다.
 * - 오늘의 주제: 하루 하나 글쓰기 주제 넣기·고치기·지우기
 * - 문의함: 내 정보 → 문의하기로 들어온 글 읽고 답하기
 */
export default function AdminPage() {
  useDocumentTitle('관리자');
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'topics';
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [locking, setLocking] = useState(false);

  const status = useFetch(() => adminService.status(), [user.isAdmin]);
  const enabled = Boolean(status.data?.enabled);
  const isAdmin = enabled && user.isAdmin;
  // 탭 이름 옆에 확인 전 문의 개수
  const inbox = useFetch(() => adminService.listInquiries({ status: 'open', limit: 1 }), [isAdmin], { enabled: isAdmin });
  const openCount = isAdmin ? (inbox.data?.counts.open ?? 0) : 0;

  const stopAdmin = async () => {
    setLocking(true);
    try {
      await adminService.lock();
      updateUser({ isAdmin: false });
      toast.info('관리자 모드를 껐어요.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLocking(false);
    }
  };

  let body;
  if (status.loading && !status.data) {
    body = <Loading label="관리자 설정을 확인하는 중..." />;
  } else if (status.error && !status.data) {
    body = <ErrorMessage error={status.error} onRetry={status.reload} />;
  } else if (!enabled) {
    body = (
      <EmptyState
        icon="warning"
        title="관리자 기능이 꺼져 있어요"
        description="서버의 .env 에 ADMIN_PASSWORD 를 8자 이상으로 정하고 서버를 다시 켜면 쓸 수 있어요. (README 의 '관리자' 참고)"
      />
    );
  } else if (!user.isAdmin) {
    body = (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-8 text-center">
        <PixelIcon name="key" size={56} />
        <p className="text-[15px]">
          관리자 비밀번호를 넣으면 이 계정으로 <b>오늘의 주제</b>를 편집하고 <b>문의함</b>을 볼 수 있어요.
        </p>
        <Button variant="default" onClick={() => setUnlockOpen(true)} aria-haspopup="dialog">
          관리자 비밀번호 넣기...
        </Button>
      </div>
    );
  } else {
    body = (
      <Tabs
        tabs={[
          { value: 'topics', label: '오늘의 주제' },
          { value: 'inquiries', label: openCount > 0 ? `문의함 (${openCount})` : '문의함' },
        ]}
        value={tab}
        onChange={(value) => setSearchParams(value === 'topics' ? {} : { tab: value }, { replace: true })}
        label="관리자 메뉴"
      >
        {tab === 'topics' ? <AdminTopicManager /> : <AdminInquiryPanel onChange={inbox.reload} />}
      </Tabs>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Window
        title="관리자 - 제어판"
        icon={<PixelIcon name="key" size={14} />}
        onClose={() => navigate('/')}
        closeLabel="홈으로"
        statusBar={
          <>
            <span className="flex-1">{isAdmin ? `${user.nickname} 님은 관리자예요` : '관리자 전용'}</span>
            {isAdmin && (
              <button type="button" className="text-inherit underline" onClick={stopAdmin} disabled={locking}>
                관리자 그만하기
              </button>
            )}
          </>
        }
      >
        {body}
      </Window>
      <AdminUnlockDialog open={unlockOpen} onClose={() => setUnlockOpen(false)} />
    </div>
  );
}
