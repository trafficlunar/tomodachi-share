import { atom } from "nanostores";

interface SessionData {
	user?: {
		id: string;
		image: string;
		name: string;
	};
}

// Undefined means still loading, null means no session
export const session = atom<SessionData | null | undefined>(undefined);
