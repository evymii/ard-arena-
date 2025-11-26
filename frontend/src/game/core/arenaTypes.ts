export const ArenaType = {
  TOWER: 0,
  THRONE_ROOM: 1,
} as const;

export type ArenaType = (typeof ArenaType)[keyof typeof ArenaType];
