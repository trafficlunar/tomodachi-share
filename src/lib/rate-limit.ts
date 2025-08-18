import { NextRequest, NextResponse } from "next/server";
import { Redis } from "ioredis";
import { auth } from "./auth";

const redis = new Redis(process.env.REDIS_URL!);
const windowSize = 60;

interface RateLimitData {
	success: boolean;
	limit: number;
	remaining: number;
	expires: number;
}

// Fixed window implementation
export class RateLimit {
	private request: NextRequest;
	private maxRequests: number;
	private pathname: string; // instead of using the request's pathname, use this custom one to group all routes together
	private data: RateLimitData;

	constructor(request: NextRequest, maxRequests: number, pathname?: string) {
		this.request = request;
		this.maxRequests = maxRequests;
		this.pathname = pathname ? pathname : this.request.nextUrl.pathname;
		this.data = {
			success: true,
			limit: maxRequests,
			remaining: maxRequests,
			expires: Date.now(),
		};
	}

	// Check and update rate limit
	async check(identifier: string): Promise<RateLimitData> {
		const key = `ratelimit:${this.pathname}:${identifier}`;

		const now = Date.now();
		const seconds = Math.floor(now / 1000);
		const currentWindow = Math.floor(seconds / windowSize) * windowSize;
		const expireAt = currentWindow + windowSize;

		try {
			// Create a Redis transaction
			const tx = redis.multi();
			tx.incr(key);
			tx.expireat(key, expireAt);

			// Execute transaction and get the count
			const results = await tx.exec();
			if (!results) {
				throw new Error("Redis transaction failed");
			}

			const count = results[0][1] as number;
			const success = count <= this.maxRequests;
			const remaining = Math.max(0, this.maxRequests - count);

			return { success, limit: this.maxRequests, remaining, expires: expireAt };
		} catch (error) {
			console.error("Rate limit check failed", error);
			return {
				success: false,
				limit: this.maxRequests,
				remaining: this.maxRequests,
				expires: expireAt,
			};
		}
	}

	// Attach rate limit headers to a response
	sendResponse(body: object | Buffer, status: number = 200, headers?: HeadersInit): NextResponse<object | unknown> {
		let response: NextResponse;

		if (Buffer.isBuffer(body)) {
			response = new NextResponse(new Uint8Array(body), { status, headers }); // convert to Uint8Array due to weird types issue
		} else {
			response = NextResponse.json(body, { status, headers });
		}

		response.headers.set("X-RateLimit-Limit", this.data.limit.toString());
		response.headers.set("X-RateLimit-Remaining", this.data.remaining.toString());
		response.headers.set("X-RateLimit-Expires", this.data.expires.toString());

		return response;
	}

	// Handle both functions above and identifier in one
	async handle(): Promise<NextResponse<object | unknown> | undefined> {
		const session = await auth();
		const ip = this.request.headers.get("CF-Connecting-IP") || this.request.headers.get("X-Forwarded-For")?.split(",")[0];
		const identifier = (session ? session.user.id : ip) ?? "anonymous";

		this.data = await this.check(identifier);

		if (!this.data.success) return this.sendResponse({ error: "Rate limit exceeded. Please try again later." }, 429);
		return;
	}
}
