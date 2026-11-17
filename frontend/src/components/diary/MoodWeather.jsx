import { MOODS, WEATHERS, moodOf, weatherOf } from '../../utils/moods.js';
import { cx } from '../../utils/cx.js';
import PixelIcon from '../ui/PixelIcon.jsx';

function ChoiceRow({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1">
      <span className="label mb-0 mr-2 w-10 shrink-0">{label}</span>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className="btn-tool min-h-[34px] px-2"
            aria-pressed={selected}
            title={selected ? `${option.label} (다시 누르면 선택 취소)` : option.label}
            onClick={() => onChange(selected ? null : option.id)}
          >
            <PixelIcon name={option.icon} size={18} />
            <span className="text-[13px]">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** 일기 쓰기: 기분과 날씨 고르기 (선택 사항, 같은 것을 다시 누르면 취소) */
export function MoodWeatherPicker({ mood, weather, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <ChoiceRow label="기분" options={MOODS} value={mood} onChange={(next) => onChange({ mood: next, weather })} />
      <ChoiceRow label="날씨" options={WEATHERS} value={weather} onChange={(next) => onChange({ mood, weather: next })} />
    </div>
  );
}

/** 일기에 붙은 기분·날씨 표시. compact 이면 아이콘만 */
export function MoodWeatherBadge({ mood, weather, compact = false, className }) {
  const moodInfo = moodOf(mood);
  const weatherInfo = weatherOf(weather);
  if (!moodInfo && !weatherInfo) return null;

  if (compact) {
    return (
      <span className={cx('inline-flex shrink-0 items-center gap-1', className)}>
        {moodInfo && <PixelIcon name={moodInfo.icon} size={13} title={`기분: ${moodInfo.label}`} />}
        {weatherInfo && <PixelIcon name={weatherInfo.icon} size={13} title={`날씨: ${weatherInfo.label}`} />}
      </span>
    );
  }
  return (
    <span className={cx('flex flex-wrap items-center gap-2', className)}>
      {moodInfo && (
        <span className="chip">
          <PixelIcon name={moodInfo.icon} size={13} />
          기분 {moodInfo.label}
        </span>
      )}
      {weatherInfo && (
        <span className="chip">
          <PixelIcon name={weatherInfo.icon} size={13} />
          날씨 {weatherInfo.label}
        </span>
      )}
    </span>
  );
}
