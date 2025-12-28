export type Box = { x: number; y: number; w: number; h: number };
export type Point = { x: number; y: number };

export type DemoEvent =
  | { t: number; type: "focus"; box: Box; label?: string }
  | { t: number; type: "click"; point: Point; box?: Box; label?: string }
  | { t: number; type: "callout"; box: Box; label: string }
  | { t: number; type: "type"; text: string; box?: Box; label?: string }
  | { t: number; type: "scroll"; direction: "up" | "down"; amount: number }
  | { t: number; type: "wait"; duration: number; label?: string };

export interface DemoMeta {
  width: number;
  height: number;
  fps: number;
}

export interface DemoTrack {
  meta: DemoMeta;
  events: DemoEvent[];
}

export interface CameraTarget {
  startFrame: number;
  endFrame: number;
  box: Box;
  zoom: number;
}

export interface CursorKeyframe {
  frame: number;
  point: Point;
  isClick: boolean;
}
