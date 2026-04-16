import { atom } from "nanostores";

interface SessionData {
	user?: {
		id: string;
		image: string;
		name: string;
	};
}

export const session = atom<SessionData | null>(null);
