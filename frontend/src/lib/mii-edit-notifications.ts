/**
 * Pure helpers for POST /api/mii/:id/edit responses and Router state for the edit-success banner.
 * Kept dependency-free so they are easy to unit test.
 */

export type MiiEditApiBody = {
	success?: boolean;
	error?: unknown;
	message?: unknown;
};

export type NavigateAfterEditState = {
	miiEdited: boolean;
	miiEditedMessage?: string;
};

/** What to render on the Mii page from Router location.state (edit success navigation). */
export function deriveEditSuccessFlashFromLocationState(locationState: unknown): { show: boolean; message?: string } {
	const s = locationState as { miiEdited?: boolean; miiEditedMessage?: string } | null;
	return s?.miiEdited ? { show: true, message: typeof s.miiEditedMessage === "string" ? s.miiEditedMessage : undefined } : { show: false };
}

/** Error string when fetch().json() throws but we already received a Response. */
export function errorMessageAfterJsonFailure(response: Response): string {
	return response.ok ? "Invalid response from server." : `Something went wrong (${response.status}). Please try again.`;
}

/** Result after a successful JSON body parse — either show error on edit page or navigate with flash state. */
export type InterpretMiiEditOutcome =
	| { kind: "failure"; error: string }
	| {
			kind: "success";
			navigate: {
				path: string;
				state: NavigateAfterEditState;
			};
	  };

/**
 * Maps HTTP status + parsed JSON from the edit endpoint to either an inline error string
 * or the navigation payload used after a successful save (including Router state for the green banner).
 */
export function interpretMiiEditResponse(response: Response, data: unknown, miiId: number): InterpretMiiEditOutcome {
	const body = data as MiiEditApiBody;

	if (!response.ok) {
		const msg =
			typeof body.error === "string"
				? body.error
				: body.error !== undefined
					? String(body.error)
					: `Could not save changes (${response.status}). Please try again.`;
		return { kind: "failure", error: msg };
	}

	if (!body.success) {
		const err = typeof body.error === "string" ? body.error : "Could not save changes. Please try again.";
		return { kind: "failure", error: err };
	}

	const message = typeof body.message === "string" ? body.message : undefined;
	const state: NavigateAfterEditState = {
		miiEdited: true,
		...(message !== undefined ? { miiEditedMessage: message } : {}),
	};

	return {
		kind: "success",
		navigate: {
			path: `/mii/${miiId}`,
			state,
		},
	};
}
