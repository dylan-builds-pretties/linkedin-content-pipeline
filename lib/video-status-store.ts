import fs from "node:fs";
import path from "node:path";
import type { VideoGenerationStatus } from "./video-types";

const STATUS_DIR = path.join(process.cwd(), "demos", "artifacts", "status");

function ensureStatusDir() {
  if (!fs.existsSync(STATUS_DIR)) {
    fs.mkdirSync(STATUS_DIR, { recursive: true });
  }
}

export function setStatus(id: string, status: VideoGenerationStatus): void {
  ensureStatusDir();
  fs.writeFileSync(
    path.join(STATUS_DIR, `${id}.json`),
    JSON.stringify(status, null, 2)
  );
}

export function getStatus(id: string): VideoGenerationStatus | null {
  ensureStatusDir();
  const filePath = path.join(STATUS_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function updateStatus(
  id: string,
  updates: Partial<VideoGenerationStatus>
): VideoGenerationStatus | null {
  const current = getStatus(id);
  if (!current) return null;
  const updated = { ...current, ...updates };
  setStatus(id, updated);
  return updated;
}

export function deleteStatus(id: string): void {
  const filePath = path.join(STATUS_DIR, `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export function getAllStatuses(): VideoGenerationStatus[] {
  ensureStatusDir();
  const files = fs.readdirSync(STATUS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const content = fs.readFileSync(path.join(STATUS_DIR, f), "utf-8");
    return JSON.parse(content);
  });
}
