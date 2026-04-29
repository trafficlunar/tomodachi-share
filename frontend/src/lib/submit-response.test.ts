import { describe, expect, it } from "vitest";

import { interpretSubmitResponse } from "./submit-response";

describe("interpretSubmitResponse", () => {
	it("success returns numeric mii id", () => {
		const response = jsonResponse(200, { id: 99 });
		expect(interpretSubmitResponse(response, { id: 99 })).toEqual({ kind: "success", miiId: 99 });
	});

	it("failure forwards string error when not ok", () => {
		const response = jsonResponse(503, { error: "Submissions are temporarily disabled" });
		expect(interpretSubmitResponse(response, { error: "Submissions are temporarily disabled" })).toEqual({
			kind: "failure",
			error: "Submissions are temporarily disabled",
		});
	});

	it("failure mirrors String(undefined) when not ok and error missing", () => {
		const response = jsonResponse(400, {});
		expect(interpretSubmitResponse(response, {}).error).toBe("undefined");
	});

	it("invalid id shape on OK response is rejected", () => {
		const response = jsonResponse(200, { id: "not-a-number" });
		expect(interpretSubmitResponse(response, { id: "not-a-number" })).toEqual({
			kind: "failure",
			error: "Invalid response from server.",
		});
	});

	it("non-OK with object error matches String semantics", () => {
		const errObj = { field: "x" };
		const response = jsonResponse(422, { error: errObj });
		expect(interpretSubmitResponse(response, { error: errObj })).toEqual({
			kind: "failure",
			error: String(errObj),
		});
	});

	it("truncates float id when server returned a whole number coerced oddly", () => {
		const response = jsonResponse(200, { id: 12.0 });
		expect(interpretSubmitResponse(response, { id: 12 })).toEqual({ kind: "success", miiId: 12 });
	});
});

function jsonResponse(status: number, body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}
