// 공유 공간 규칙 (서버 backend/src/config/constants.js 의 MAX_ROOM_MEMBERS 와 같은 값)
export const MAX_ROOM_MEMBERS = 6;

/** 나를 뺀 공간 사람들 (들어온 순서) */
export const othersOf = (members, meId) => (members ?? []).filter((member) => member.id !== meId);

/**
 * '하루님' / '하루님, 별이님' / '하루님, 별이님 외 2명'.
 * 늘 받침 있는 말('님', '명')로 끝나서 뒤에 '과', '이' 를 붙이면 된다.
 */
export function namesOf(people, max = 2) {
  const names = people.map((person) => `${person.nickname}님`);
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} 외 ${names.length - max}명`;
}

/** 공간을 부르는 말: 둘이면 '우리 둘', 여럿이면 '우리 N명' */
export const groupLabel = (count) => (count <= 2 ? '우리 둘' : `우리 ${count}명`);
