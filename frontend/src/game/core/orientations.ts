export const Orientation = {
  LEFT: "left",
  RIGHT: "right",
} as const;

export type Orientation = (typeof Orientation)[keyof typeof Orientation];
