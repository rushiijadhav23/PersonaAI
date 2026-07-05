export type PersonaId = "hitesh" | "piyush";

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  /** true while this assistant message is still streaming in */
  streaming?: boolean;
  /** true if this message represents an error state */
  isError?: boolean;
}

export interface PersonaMeta {
  id: PersonaId;
  displayName: string;
  tabLabel: string;
  tagline: string;
  accentVar: string;
}

export const PERSONAS: PersonaMeta[] = [
  {
    id: "hitesh",
    displayName: "Hitesh Choudhary",
    tabLabel: "hitesh.md",
    tagline: "Chai aur Code",
    accentVar: "--accent-hitesh",
  },
  {
    id: "piyush",
    displayName: "Piyush Garg",
    tabLabel: "piyush.md",
    tagline: "Build. Ship. Repeat.",
    accentVar: "--accent-piyush",
  },
];

export function getPersonaMeta(id: PersonaId): PersonaMeta {
  const meta = PERSONAS.find((p) => p.id === id);
  if (!meta) throw new Error(`Unknown persona: ${id}`);
  return meta;
}
