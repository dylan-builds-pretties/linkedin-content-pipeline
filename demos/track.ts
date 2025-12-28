import fs from "node:fs";
import path from "node:path";

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

export class Tracker {
  private t0 = Date.now();
  public events: DemoEvent[] = [];

  constructor(public meta: DemoMeta) {}

  now(): number {
    return (Date.now() - this.t0) / 1000;
  }

  addFocus(box: Box, label?: string): void {
    const event: DemoEvent = { t: this.now(), type: "focus", box, label };
    this.events.push(event);
  }

  addClick(point: Point, box?: Box, label?: string): void {
    const event: DemoEvent = { t: this.now(), type: "click", point, box, label };
    this.events.push(event);
  }

  addCallout(box: Box, label: string): void {
    const event: DemoEvent = { t: this.now(), type: "callout", box, label };
    this.events.push(event);
  }

  addType(text: string, box?: Box, label?: string): void {
    const event: DemoEvent = { t: this.now(), type: "type", text, box, label };
    this.events.push(event);
  }

  addScroll(direction: "up" | "down", amount: number): void {
    const event: DemoEvent = { t: this.now(), type: "scroll", direction, amount };
    this.events.push(event);
  }

  addWait(duration: number, label?: string): void {
    const event: DemoEvent = { t: this.now(), type: "wait", duration, label };
    this.events.push(event);
  }

  getTrack(): DemoTrack {
    return { meta: this.meta, events: this.events };
  }

  save(filepath: string): void {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(
      filepath,
      JSON.stringify({ meta: this.meta, events: this.events }, null, 2)
    );
  }
}
