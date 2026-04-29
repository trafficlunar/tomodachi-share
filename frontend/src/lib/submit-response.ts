/**
 * Pure helper for POST /api/submit responses (new Mii ID or error).
 * Unit-testable without running the Next server.
 */

export type SubmitApiBody = {
	id?: unknown;
	error?: unknown;
};

export type InterpretSubmitOutcome =
	| { kind: "failure"; error: string }
	| { kind: "success"; miiId: number };

/**
 * Mirrors the submit page: `error` destructured from JSON — `String(error)` includes `"undefined"` if missing.
 */
export function interpretSubmitResponse(response: Response, data: unknown): InterpretSubmitOutcome {
	const body = data as SubmitApiBody;

	if (!response.ok) {
		return { kind: "failure", error: String(body.error) };
	}

	if (typeof body.id !== "number" || !Number.isFinite(body.id)) {
		return { kind: "failure", error: "Invalid response from server." };
	}

	return { kind: "success", miiId: Math.trunc(body.id) };
}
