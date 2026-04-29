import { describe, expect, it } from "vitest";

import {
	deriveEditSuccessFlashFromLocationState,
	errorMessageAfterJsonFailure,
	interpretMiiEditResponse,
} from "./mii-edit-notifications";

function jsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

describe("interpretMiiEditResponse", () => {
	it("returns success navigation with server message for the green banner", () => {
		const body = { success: true, message: "Mii updated successfully." };
		const response = jsonResponse(200, body);
		const out = interpretMiiEditResponse(response, body, 42);
		expect(out).toEqual({
			kind: "success",
			navigate: {
				path: "/mii/42",
				state: { miiEdited: true, miiEditedMessage: "Mii updated successfully." },
			},
		});
	});

	it("returns success without miiEditedMessage when message is missing (default copy on Mii page)", () => {
		const body = { success: true };
		const response = jsonResponse(200, body);
		const out = interpretMiiEditResponse(response, body, 7);
		expect(out).toEqual({
			kind: "success",
			navigate: {
				path: "/mii/7",
				state: { miiEdited: true },
			},
		});
	});

	it("returns API error message on non-OK response", () => {
		const body = { error: "Nothing was changed" };
		const response = jsonResponse(400, body);
		const out = interpretMiiEditResponse(response, body, 1);
		expect(out).toEqual({ kind: "failure", error: "Nothing was changed" });
	});

	it("uses status fallback when OK but success is false", () => {
		const response = jsonResponse(200, { success: false, error: "bad" });
		const out = interpretMiiEditResponse(response, { success: false, error: "bad" }, 2);
		expect(out).toEqual({ kind: "failure", error: "bad" });
	});

	it("uses status fallback when OK, success false, and error is not a string", () => {
		const response = jsonResponse(200, { success: false });
		const out = interpretMiiEditResponse(response, { success: false }, 3);
		expect(out).toEqual({ kind: "failure", error: "Could not save changes. Please try again." });
	});

	it("formats error when non-OK and error field is missing", () => {
		const response = jsonResponse(500, {});
		const out = interpretMiiEditResponse(response, {}, 9);
		expect(out).toEqual({ kind: "failure", error: "Could not save changes (500). Please try again." });
	});

	it("429 rate limit preserves string message from API", () => {
		const body = { error: "Rate limit exceeded. Please try again later." };
		const response = jsonResponse(429, body);
		expect(interpretMiiEditResponse(response, body, 1)).toEqual({
			kind: "failure",
			error: "Rate limit exceeded. Please try again later.",
		});
	});

	it("non-OK converts non-string error via String()", () => {
		const payload = { error: { nest: true } };
		const response = jsonResponse(400, payload);
		expect(interpretMiiEditResponse(response, payload as unknown, 1)).toEqual({
			kind: "failure",
			error: "[object Object]",
		});
	});

	it("OK with success missing is treated like success false", () => {
		const response = jsonResponse(200, {});
		expect(interpretMiiEditResponse(response, {}, 55)).toEqual({
			kind: "failure",
			error: "Could not save changes. Please try again.",
		});
	});

	it('empty-string message keys are kept (shows empty banner vs default — contract test)', () => {
		const body = { success: true, message: "" };
		const response = jsonResponse(200, body);
		expect(interpretMiiEditResponse(response, body, 2)).toEqual({
			kind: "success",
			navigate: {
				path: "/mii/2",
				state: { miiEdited: true, miiEditedMessage: "" },
			},
		});
	});

	it("numeric message field is ignored (not a banner string)", () => {
		const body = { success: true, message: 12345 };
		const response = jsonResponse(200, body as unknown as object);
		expect(interpretMiiEditResponse(response, body, 3)).toEqual({
			kind: "success",
			navigate: { path: "/mii/3", state: { miiEdited: true } },
		});
	});

	it("uses large mii id in path without mangling", () => {
		const body = { success: true };
		const response = jsonResponse(200, body);
		expect(interpretMiiEditResponse(response, body, 9_876_543)).toEqual({
			kind: "success",
			navigate: { path: "/mii/9876543", state: { miiEdited: true } },
		});
	});
});

describe("errorMessageAfterJsonFailure", () => {
	it("invalid JSON when response was OK", () => {
		const r = new Response("not json", { status: 200 });
		expect(errorMessageAfterJsonFailure(r)).toBe("Invalid response from server.");
	});

	it("invalid JSON when response was error", () => {
		const r = new Response("<html>", { status: 502 });
		expect(errorMessageAfterJsonFailure(r)).toBe("Something went wrong (502). Please try again.");
	});
});

describe("deriveEditSuccessFlashFromLocationState", () => {
	it("shows banner with custom message after navigate from edit", () => {
		expect(
			deriveEditSuccessFlashFromLocationState({
				miiEdited: true,
				miiEditedMessage: "Mii updated successfully.",
			}),
		).toEqual({ show: true, message: "Mii updated successfully." });
	});

	it("shows banner with undefined message (UI uses default string)", () => {
		expect(deriveEditSuccessFlashFromLocationState({ miiEdited: true })).toEqual({
			show: true,
			message: undefined,
		});
	});

	it("hides banner when navigation has no edit flag", () => {
		expect(deriveEditSuccessFlashFromLocationState(null)).toEqual({ show: false });
		expect(deriveEditSuccessFlashFromLocationState(undefined)).toEqual({ show: false });
		expect(deriveEditSuccessFlashFromLocationState({})).toEqual({ show: false });
	});

	it("hides banner when miiEdited is explicitly false", () => {
		expect(
			deriveEditSuccessFlashFromLocationState({
				miiEdited: false,
				miiEditedMessage: "ignored",
			}),
		).toEqual({ show: false });
	});

	it("ignores non-string miiEditedMessage in location state", () => {
		expect(
			deriveEditSuccessFlashFromLocationState({
				miiEdited: true,
				miiEditedMessage: 123 as unknown as string,
			}),
		).toEqual({ show: true, message: undefined });
	});
});
