"use client";

import { ProgressProvider } from "@bprogress/next/app";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ProgressProvider height="4px" color="var(--color-amber-500)" options={{ showSpinner: false }} shallowRouting>
			{children}
		</ProgressProvider>
	);
}
