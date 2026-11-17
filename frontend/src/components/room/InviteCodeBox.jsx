import { Copy, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import Button from '../ui/Button.jsx';

export const formatInviteCode = (code = '') => (code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code);

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // 오래된 브라우저/비보안 출처용
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  area.remove();
  if (!ok) throw new Error('copy failed');
}

/** 초대 코드 표시 + 복사 (+ 새 코드 발급) */
export default function InviteCodeBox({ code, onRegenerate, regenerating = false, compact = false }) {
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await copyText(code);
      toast.success('초대 코드를 복사했어요. 친구에게 보내 주세요.');
    } catch {
      toast.error('복사하지 못했어요. 코드를 직접 길게 눌러 복사해 주세요.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <output
        className={`sunken select-all px-3 py-1.5 tracking-[0.25em] ${compact ? 'text-[15px]' : 'text-[24px] sm:text-[30px]'}`}
        aria-label={`초대 코드 ${code.split('').join(' ')}`}
      >
        {formatInviteCode(code)}
      </output>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleCopy} icon={<Copy size={12} />}>
          복사
        </Button>
        {onRegenerate && (
          <Button size="sm" onClick={onRegenerate} loading={regenerating} icon={<RefreshCw size={12} />}>
            새 코드
          </Button>
        )}
      </div>
    </div>
  );
}
