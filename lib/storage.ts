import { promises as fs } from "fs";
import path from "path";
import type { Stage, Post, PostStatus, PipelineStats } from "./types";

// Map stages to their folder paths (simplified to just ideas and posts)
const STAGE_PATHS: Record<Stage, string> = {
  ideas: "content/ideas",
  posts: "content/posts",
};

// Get the absolute path for a stage
function getStagePath(stage: Stage): string {
  return path.join(process.cwd(), STAGE_PATHS[stage]);
}

// Get the absolute path for a specific file
function getFilePath(stage: Stage, id: string): string {
  return path.join(getStagePath(stage), `${id}.json`);
}

// Ensure a directory exists
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Check if a file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read all JSON files from a stage folder
 * Returns an array of parsed objects
 */
export async function readAllFromStage<T>(stage: Stage): Promise<T[]> {
  const stagePath = getStagePath(stage);

  try {
    await ensureDirectory(stagePath);
    const files = await fs.readdir(stagePath);
    const jsonFiles = files.filter(
      (file) => file.endsWith(".json") && !file.startsWith("_")
    );

    const items: T[] = [];
    for (const file of jsonFiles) {
      try {
        const filePath = path.join(stagePath, file);
        const content = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(content) as T;
        items.push(parsed);
      } catch (error) {
        console.error(`Error reading file ${file}:`, error);
        // Continue reading other files even if one fails
      }
    }

    return items;
  } catch (error) {
    console.error(`Error reading stage ${stage}:`, error);
    return [];
  }
}

/**
 * Read a single JSON file by id from a stage
 * Returns the parsed object or null if not found
 */
export async function readOne<T>(stage: Stage, id: string): Promise<T | null> {
  const filePath = getFilePath(stage, id);

  try {
    if (!(await fileExists(filePath))) {
      return null;
    }
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading file ${id} from ${stage}:`, error);
    return null;
  }
}

/**
 * Write or update a JSON file in a stage
 * Returns true on success, false on failure
 */
export async function writeOne<T>(
  stage: Stage,
  id: string,
  data: T
): Promise<boolean> {
  const stagePath = getStagePath(stage);
  const filePath = getFilePath(stage, id);

  try {
    await ensureDirectory(stagePath);
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing file ${id} to ${stage}:`, error);
    return false;
  }
}

/**
 * Delete a JSON file from a stage
 * Returns true on success, false on failure
 */
export async function deleteOne(stage: Stage, id: string): Promise<boolean> {
  const filePath = getFilePath(stage, id);

  try {
    if (!(await fileExists(filePath))) {
      return false;
    }
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${id} from ${stage}:`, error);
    return false;
  }
}

/**
 * Move content from one stage to another
 * Optionally update the data during the move
 * Returns the new data on success, null on failure
 */
export async function moveToStage<T, U = T>(
  fromStage: Stage,
  toStage: Stage,
  id: string,
  newData?: U
): Promise<U | null> {
  try {
    // Read the original data if no new data is provided
    const originalData = await readOne<T>(fromStage, id);
    if (!originalData && !newData) {
      console.error(`File ${id} not found in ${fromStage}`);
      return null;
    }

    // Determine the data to write
    const dataToWrite = newData ?? (originalData as unknown as U);

    // Write to the new stage
    const writeSuccess = await writeOne(toStage, id, dataToWrite);
    if (!writeSuccess) {
      return null;
    }

    // Delete from the original stage
    await deleteOne(fromStage, id);

    return dataToWrite;
  } catch (error) {
    console.error(`Error moving ${id} from ${fromStage} to ${toStage}:`, error);
    return null;
  }
}

/**
 * Count all items in a stage
 */
export async function countInStage(stage: Stage): Promise<number> {
  const stagePath = getStagePath(stage);

  try {
    await ensureDirectory(stagePath);
    const files = await fs.readdir(stagePath);
    const jsonFiles = files.filter(
      (file) => file.endsWith(".json") && !file.startsWith("_")
    );
    return jsonFiles.length;
  } catch (error) {
    console.error(`Error counting files in ${stage}:`, error);
    return 0;
  }
}

/**
 * Read all posts filtered by status
 */
export async function readPostsByStatus(status: PostStatus): Promise<Post[]> {
  const posts = await readAllFromStage<Post>("posts");
  return posts.filter((p) => p.status === status);
}

/**
 * Get pipeline statistics - counts ideas and posts by status
 */
export async function getPipelineStats(): Promise<PipelineStats> {
  const [ideaCount, posts] = await Promise.all([
    countInStage("ideas"),
    readAllFromStage<Post>("posts"),
  ]);

  return {
    ideas: ideaCount,
    drafts: posts.filter((p) => p.status === "draft").length,
    draftsReadyForReview: posts.filter((p) => p.status === "ready_for_review").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
    published: posts.filter((p) => p.status === "published").length,
  };
}

/**
 * Generate a unique ID based on timestamp and random string
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}

/**
 * Get current ISO timestamp
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}
