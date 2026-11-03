import type { PatientLook } from '../types';

/** 教學情境用的虛擬人物外觀（皆為虛構人物） */
export const LOOK = {
  midF: { name: '陳太太', age: 52, sex: 'F', hair: 'bun', hairColor: '#3f3f46', shirt: '#fda4af' },
  oldM: { name: '王伯伯', age: 71, sex: 'M', hair: 'bald', hairColor: '#a8a29e', shirt: '#93c5fd', glasses: true },
  youngM: { name: '張先生', age: 34, sex: 'M', hair: 'short', hairColor: '#1f2937', shirt: '#86efac' },
  midM: { name: '李先生', age: 58, sex: 'M', hair: 'short', hairColor: '#57534e', shirt: '#fcd34d' },
  youngF: { name: '吳小姐', age: 29, sex: 'F', hair: 'long', hairColor: '#292524', shirt: '#c4b5fd' },
  oldF: { name: '黃奶奶', age: 78, sex: 'F', hair: 'short', hairColor: '#d6d3d1', shirt: '#fdba74' },
} satisfies Record<string, PatientLook>;
