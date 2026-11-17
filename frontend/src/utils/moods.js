// 일기 기분·날씨 (서버 backend/src/config/constants.js 의 MOODS, WEATHERS 와 같은 값)
export const MOODS = [
  { id: 'happy', label: '기쁨', icon: 'moodHappy' },
  { id: 'excited', label: '설렘', icon: 'moodExcited' },
  { id: 'calm', label: '평온', icon: 'moodCalm' },
  { id: 'sad', label: '우울', icon: 'moodSad' },
  { id: 'angry', label: '화남', icon: 'moodAngry' },
];

export const WEATHERS = [
  { id: 'sunny', label: '맑음', icon: 'weatherSunny' },
  { id: 'cloudy', label: '흐림', icon: 'weatherCloudy' },
  { id: 'rainy', label: '비', icon: 'weatherRainy' },
  { id: 'snowy', label: '눈', icon: 'weatherSnowy' },
  { id: 'windy', label: '바람', icon: 'weatherWindy' },
];

export const moodOf = (id) => MOODS.find((mood) => mood.id === id) ?? null;
export const weatherOf = (id) => WEATHERS.find((weather) => weather.id === id) ?? null;

/** 달력에서 누가 쓴 일기인지 얼굴색으로 구분 (분홍 = 나, 라벤더 = 친구) */
export const FACE_MINE = { f: '#f29ac0' };
export const FACE_THEIRS = { f: '#b9a8e6' };
