import fs from "fs";
import path from "path";

// Supported personas - add new ones here + a matching .txt file in /personas
export type PersonaId = "hitesh" | "piyush";

const PERSONAS_DIR = path.join(__dirname, "..", "..", "personas");

function readPersonaFile(filename: string): string {
  const filePath = path.join(PERSONAS_DIR, filename);
  return fs.readFileSync(filePath, "utf-8");
}

// Loaded once at server startup - reused for every request, no per-message disk reads.
const baseInstructions = readPersonaFile("base_instructions.txt");

const personaNotes: Record<PersonaId, string> = {
  hitesh: readPersonaFile("hitesh.txt"),
  piyush: readPersonaFile("piyush.txt"),
};

export function isValidPersona(value: string): value is PersonaId {
  return value === "hitesh" || value === "piyush";
}

/**
 * Builds the full system prompt for a given persona:
 * shared base instructions + that persona's specific notes.
 */
export function getSystemPrompt(persona: PersonaId): string {
  return `${baseInstructions}\n\n${personaNotes[persona]}`;
}

export function getAvailablePersonas(): PersonaId[] {
  return Object.keys(personaNotes) as PersonaId[];
}
