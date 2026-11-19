// 바탕 그림 도트: 구름, 해. 한 글자 = 한 픽셀, '.' 은 투명.
// 처음 모양은 생성 스크립트로 그렸고, 손으로 고쳐도 된다. 색은 index.css 의 테마 변수를 따른다.

/** 구름: s 는 아래쪽 그늘색 (테마마다 다름) */
export const CLOUD_PALETTE = { w: 'var(--cloud)', s: 'var(--cloud-shade)' };

/** 해: o 가운데, h 둘레와 점점이 퍼지는 빛 */
export const SUN_PALETTE = { o: 'var(--sun-core)', h: 'var(--sun-glow)' };

export const CLOUDS = {
  cloudBig: [
    '................................................',
    '.................wwwww.....wwwww................',
    '...............wwwwwwwww.wwwwwwwww..............',
    '..............wwwwwwwwwwwwwwwwwwww..............',
    '..............wwwwwwwwwwwwwwwwwwwww.............',
    '........wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww........',
    '.......wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.......',
    '......wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww......',
    '.....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww......',
    '.....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.....',
    '.....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.....',
    '.....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.....',
    '.....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.....',
    '.....wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww.....',
    '......ssssssssssssssssssssssssssssssssssss......',
    '.......ssssssssssssssssssssssssssssssssss.......',
  ],
  cloudMid: [
    '................w.................',
    '.............wwwwwww..............',
    '............wwwwwwwww....w........',
    '........w...wwwwwwwww..wwwww......',
    '......wwwww.wwwwwwwww.wwwwwww.....',
    '.....wwwwwwwwwwwwwwwwwwwwwwwww....',
    '....wwwwwwwwwwwwwwwwwwwwwwwwww....',
    '....wwwwwwwwwwwwwwwwwwwwwwwwww....',
    '....wwwwwwwwwwwwwwwwwwwwwwwwww....',
    '....wwwwwwwwwwwwwwwwwwwwwwwwww....',
    '.....ssssssssssssssssssssssss.....',
    '......ssssssssssssssssssssss......',
  ],
  cloudSmall: [
    '......................',
    '..........wwwww.......',
    '.........wwwwwww......',
    '....wwwwwwwwwwwwwww...',
    '...wwwwwwwwwwwwwwwww..',
    '...wwwwwwwwwwwwwwwww..',
    '...wwwwwwwwwwwwwwwww..',
    '....sssssssssssssss...',
    '.....sssssssssssss....',
  ],
};

export const SUN = [
  '...............................',
  '...............................',
  '..........h.h.h.h.h.h..........',
  '.............h.h.h.............',
  '........h.h.h.h.h.h.h.h........',
  '.........h.h.hhhhh.h.h.........',
  '......h.h.hhhhhhhhhhh.h.h......',
  '.......h.hhhhhhhhhhhhh.h.......',
  '....h.h.hhhhhooooohhhhh.h.h....',
  '.....h.hhhhooooooooohhhh.h.....',
  '..h.h.hhhhooooooooooohhhh.h.h..',
  '.....hhhhooooooooooooohhhh.....',
  '..h.h.hhhooooooooooooohhh.h.h..',
  '...h.hhhooooooooooooooohhh.h...',
  '..h.hhhhooooooooooooooohhhh.h..',
  '...h.hhhooooooooooooooohhh.h...',
  '..h.hhhhooooooooooooooohhhh.h..',
  '...h.hhhooooooooooooooohhh.h...',
  '..h.h.hhhooooooooooooohhh.h.h..',
  '.....hhhhooooooooooooohhhh.....',
  '..h.h.hhhhooooooooooohhhh.h.h..',
  '.....h.hhhhooooooooohhhh.h.....',
  '....h.h.hhhhhooooohhhhh.h.h....',
  '.......h.hhhhhhhhhhhhh.h.......',
  '......h.h.hhhhhhhhhhh.h.h......',
  '.........h.h.hhhhh.h.h.........',
  '........h.h.h.h.h.h.h.h........',
  '.............h.h.h.............',
  '..........h.h.h.h.h.h..........',
  '...............................',
  '...............................',
];
