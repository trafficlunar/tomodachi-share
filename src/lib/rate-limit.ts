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
	private data: RateLimitData;

	constructor(request: NextRequest, maxRequests: number) {
		this.request = request;
		this.maxRequests = maxRequests;
		this.data = {
			success: true,
			limit: maxRequests,
			remaining: maxRequests,
			expires: Date.now(),
		};
	}

	// Check and update rate limit
	async check(identifier: string): Promise<RateLimitData> {
		const pathname = this.request.nextUrl.pathname;
		const key = `ratelimit:${pathname}:${identifier}`;

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
			const [count] = (await tx.exec().then((results) => results?.map((res) => res[1]))) as [number];

			const success = count <= this.maxRequests;
			const remaining = Math.max(0, this.maxRequests - count);

			return { success, limit: this.maxRequests, remaining, expires: expireAt };
		} catch (error) {
			console.error("Rate limit check failed", error);
			return {
				success: true,
				limit: this.maxRequests,
				remaining: this.maxRequests,
				expires: expireAt,
			};
		}
	}

	// Attach rate limit headers to a response
	sendResponse(message: object, status: number = 200): NextResponse<object> {
		const response = NextResponse.json(message, { status });
		response.headers.set("X-RateLimit-Limit", this.data.limit.toString());
		response.headers.set("X-RateLimit-Remaining", this.data.remaining.toString());
		response.headers.set("X-RateLimit-Expires", this.data.expires.toString());
		return response;
	}

	// Handle both functions above and identifier in one
	async handle(): Promise<NextResponse<object> | undefined> {
		const session = await auth();
		const ip = this.request.headers.get("CF-Connecting-IP") || this.request.headers.get("X-Forwarded-For")?.split(",")[0];
		const identifier = (session ? session.user.id : ip) ?? "null";

		this.data = await this.check(identifier);

		if (!this.data.success) return this.sendResponse({ success: false, error: "Rate limit exceeded. Please try again later." }, 429);
		return;
	}
}
