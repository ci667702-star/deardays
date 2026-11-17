import { useId, useRef } from 'react';

/** 옛 대화상자 스타일 탭. 좌우 화살표 키로 탭을 옮길 수 있다. */
export default function Tabs({ tabs, value, onChange, label, children }) {
  const baseId = useId();
  const refs = useRef([]);

  const handleKeyDown = (event, index) => {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!offset) return;
    event.preventDefault();
    const next = (index + offset + tabs.length) % tabs.length;
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={label} className="tabs">
        {tabs.map((tab, index) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                refs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              className="tab"
              onClick={() => onChange(tab.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${value}`} className="tab-panel">
        {children}
      </div>
    </div>
  );
}
