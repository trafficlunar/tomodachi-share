import { atom } from "nanostores";

export type Theme = "LIGHT" | "DARK" | "SYSTEM";

interface SessionData {
	user?: {
		id: string;
		image: string;
		name: string;
		theme?: Theme;
	};
}

// Undefined means still loading, null means no session
export const session = atom<SessionData | null | undefined>(undefined);
