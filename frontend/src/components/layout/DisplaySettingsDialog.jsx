import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { SCREENSAVER_MINUTES, previewScreensaver, readScreensaver, saveScreensaver } from '../../utils/screensaver.js';
import { THEMES } from '../../utils/theme.js';
import Button from '../ui/Button.jsx';
import Dialog from '../ui/Dialog.jsx';
import PixelIcon from '../ui/PixelIcon.jsx';
import Tabs from '../ui/Tabs.jsx';

/** 옛 '디스플레이 등록 정보' 창의 모니터 미리 보기. 화면 안쪽만 고른 색 구성표로 칠한다. */
function MonitorPreview({ themeId }) {
  return (
    <div data-theme="classic" className="mx-auto w-[264px] select-none" aria-hidden="true">
      <div className="bg-face p-[10px] pb-[8px]" style={{ boxShadow: 'var(--bevel-raised)' }}>
        <div data-theme={themeId} className="relative h-[156px] overflow-hidden bg-desk" style={{ boxShadow: 'var(--bevel-in)' }}>
          <div className="win absolute left-[10px] top-[10px] w-[150px]">
            <div className="win-title win-title--inactive !min-h-0 !py-[1px] !text-[10px]">비활성 창</div>
            <div className="h-[34px]" />
          </div>
          <div className="win absolute left-[38px] top-[44px] w-[178px]">
            <div className="win-title !min-h-0 !py-[1px] !text-[10px]">활성 창</div>
            <div className="p-[6px] text-[11px] leading-tight">
              <p>창 글자</p>
              <p className="mt-1 inline-block bg-select px-1 text-select-text">선택한 글자</p>
              <div className="mt-[6px] flex justify-end">
                <span className="btn btn--sm !min-h-[20px] !px-3 !text-[10px]">확인</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[14px] bg-face" style={{ boxShadow: 'inset 0 1px var(--color-hilite)' }} />
        </div>
        <div className="mt-[6px] flex justify-end pr-1">
          <span className="block size-[5px] bg-[#2fbf4a]" />
        </div>
      </div>
      <div className="mx-auto h-[10px] w-[90px] bg-face" style={{ boxShadow: 'var(--bevel-raised)' }} />
      <div className="mx-auto h-[8px] w-[150px] bg-face" style={{ boxShadow: 'var(--bevel-raised)' }} />
    </div>
  );
}

export default function DisplaySettingsDialog({ open, onClose }) {
  const { theme, setTheme } = useTheme();
  const [choice, setChoice] = useState(theme);
  const [tab, setTab] = useState('appearance');
  const [saver, setSaver] = useState(readScreensaver);

  useEffect(() => {
    if (open) {
      setChoice(theme);
      setSaver(readScreensaver());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const apply = () => {
    setTheme(choice);
    saveScreensaver(saver);
  };
  const saverChanged = JSON.stringify(saver) !== JSON.stringify(readScreensaver());

  const selected = THEMES.find((item) => item.id === choice) ?? THEMES[0];

  return (
    <Dialog
      open={open}
      title="디스플레이 등록 정보"
      icon={<PixelIcon name="computer" size={14} />}
      onClose={onClose}
      width={420}
      footer={
        <>
          <Button
            variant="default"
            onClick={() => {
              apply();
              onClose();
            }}
          >
            확인
          </Button>
          <Button onClick={onClose}>취소</Button>
          <Button onClick={apply} disabled={choice === theme && !saverChanged}>
            적용
          </Button>
        </>
      }
    >
      <Tabs
        label="디스플레이 설정"
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'appearance', label: '모양' },
          { value: 'screensaver', label: '화면 보호기' },
        ]}
      >
        {tab === 'screensaver' ? (
          <div className="flex flex-col gap-3">
            <div className="mx-auto grid h-[120px] w-[220px] place-items-center bg-[#000000] shadow-[var(--bevel-in)]" aria-hidden="true">
              <div className="flex gap-2">
                <span className="block size-10 rotate-[-6deg] bg-[#ffffff] p-1 pb-3">
                  <span className="block size-full bg-pink" />
                </span>
                <span className="block size-10 translate-y-4 rotate-[5deg] bg-[#ffffff] p-1 pb-3">
                  <span className="block size-full bg-lav" />
                </span>
              </div>
            </div>
            <label htmlFor="saver-kind" className="label mb-0">
              화면 보호기
            </label>
            <select
              id="saver-kind"
              className="field"
              value={saver.enabled ? 'photos' : 'none'}
              onChange={(e) => setSaver((s) => ({ ...s, enabled: e.target.value === 'photos' }))}
            >
              <option value="photos">우리 사진 (떠다니는 사진)</option>
              <option value="none">사용 안 함</option>
            </select>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label htmlFor="saver-wait" className="label">
                  대기 시간
                </label>
                <select
                  id="saver-wait"
                  className="field w-[120px]"
                  value={saver.minutes}
                  disabled={!saver.enabled}
                  onChange={(e) => setSaver((s) => ({ ...s, minutes: Number(e.target.value) }))}
                >
                  {SCREENSAVER_MINUTES.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes}분
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => {
                  onClose();
                  setTimeout(previewScreensaver, 150);
                }}
              >
                미리 보기
              </Button>
            </div>
            <p className="hint">공간에 올린 사진과 낙서가 떠다녀요. 마우스를 움직이거나 화면을 누르면 돌아와요. 이 기기에서만 적용돼요.</p>
          </div>
        ) : (
          <>
        <MonitorPreview themeId={choice} />
        <label htmlFor="color-scheme" className="label mt-5">
          색 구성표
        </label>
        <select id="color-scheme" className="field" value={choice} onChange={(e) => setChoice(e.target.value)}>
          {THEMES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <p className="hint">{selected.description}</p>
        <p className="hint">이 기기에서만 바뀌어요. 친구 화면에는 영향이 없어요.</p>
          </>
        )}
      </Tabs>
    </Dialog>
  );
}
