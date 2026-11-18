import { useEffect, useState } from 'react';
import { BellOff, BellRing, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { pushService, pushSupport } from '../../services/pushService.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../ui/Button.jsx';
import GroupBox from '../ui/GroupBox.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';

const SUPPORT_MESSAGES = {
  'desktop-app': '데스크톱 앱은 앱 자체 알림을 써요. 휴대폰 알림은 휴대폰에서 켜 주세요.',
  insecure: '휴대폰 알림은 https 주소로 접속했을 때만 켤 수 있어요.',
  'ios-browser': '아이폰·아이패드는 Safari 의 공유 → "홈 화면에 추가"로 DearDays 를 깐 다음, 그 앱에서 켤 수 있어요. (iOS 16.4 이상)',
  unsupported: '이 브라우저는 푸시 알림을 지원하지 않아요. 크롬·엣지·사파리 최신 버전에서 켜 주세요.',
};

/**
 * 내 정보의 '휴대폰 알림': 이 기기에서 친구의 새 일기·댓글 알림을 받는다.
 * 기기마다 따로 켠다 (휴대폰, 학교 컴퓨터 등).
 */
export default function PushSettings() {
  const toast = useToast();
  const support = pushSupport();
  const [state, setState] = useState({ loading: true, enabled: false, publicKey: null, devices: 0, on: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      const [status, sub] = await Promise.all([pushService.status(), pushService.currentSubscription().catch(() => null)]);
      setState({ loading: false, ...status, on: Boolean(sub) });
    } catch (err) {
      setState((s) => ({ ...s, loading: false }));
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (action, success) => {
    setBusy(true);
    setError('');
    try {
      const result = await action();
      if (success) toast.success(typeof success === 'function' ? success(result) : success);
      await refresh();
    } catch (err) {
      setError(err.code ? err.message : getErrorMessage(err, '알림 설정을 바꾸지 못했어요.'));
    } finally {
      setBusy(false);
    }
  };

  let body;
  if (support !== 'ok') {
    body = <p className="text-[14px]">{SUPPORT_MESSAGES[support]}</p>;
  } else if (state.loading) {
    body = <p className="font-small text-[12px] text-muted">알림 설정을 확인하는 중...</p>;
  } else if (!state.on && Notification.permission === 'denied') {
    body = (
      <p className="text-[14px]">
        이 기기에서 DearDays 알림이 차단돼 있어요. 주소창 왼쪽의 자물쇠(또는 휴대폰 설정 → 알림)에서 이 사이트의 알림을 허용한 뒤 새로 고쳐
        주세요.
      </p>
    );
  } else if (!state.enabled) {
    body = <p className="text-[14px]">서버에 알림 키가 아직 없어요. 서버를 관리하는 사람이 README 의 "휴대폰 알림 켜기"를 따라 설정하면 켤 수 있어요.</p>;
  } else {
    body = (
      <div className="flex flex-col gap-3">
        <p className="text-[14px]">
          {state.on ? '이 기기에서 알림을 받고 있어요.' : '친구가 일기나 댓글을 쓰면 이 기기로 알림이 와요.'}
          <span className="hint mt-0 block">내 계정으로 알림을 켠 기기: {state.devices}대</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {state.on ? (
            <>
              <Button
                size="sm"
                icon={<Send size={12} />}
                loading={busy}
                onClick={() => run(() => pushService.test(), (r) => (r.sent > 0 ? `시험 알림을 보냈어요. (기기 ${r.sent}대)` : '보낼 수 있는 기기가 없어요. 알림을 다시 켜 주세요.'))}
              >
                시험 알림 보내기
              </Button>
              <Button size="sm" icon={<BellOff size={12} />} disabled={busy} onClick={() => run(() => pushService.disable(), '이 기기의 알림을 껐어요.')}>
                이 기기 알림 끄기
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="default"
              icon={<BellRing size={12} />}
              loading={busy}
              onClick={() => run(() => pushService.enable(state.publicKey), '이 기기에서 알림을 받아요!')}
            >
              이 기기에서 알림 받기
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <GroupBox title="휴대폰 알림">
      <div className="flex items-start gap-3">
        <PixelIcon name="bell" size={28} className="mt-0.5" />
        <div className="min-w-0 flex-1">
          {body}
          {error && <p className="hint hint--error">{error}</p>}
        </div>
      </div>
    </GroupBox>
  );
}
