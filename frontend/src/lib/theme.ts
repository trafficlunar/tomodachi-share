import { atom } from "nanostores";

export type Theme = "LIGHT" | "DARK" | "SYSTEM";

const THEME_COOKIE_NAME = "theme";

// Theme store - undefined means not yet initialized
export const themeStore = atom<Theme | undefined>(undefined);

// Get system theme preference
function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Get resolved theme (actual light/dark to apply)
export function getResolvedTheme(theme: Theme): "light" | "dark" {
	if (theme === "SYSTEM") return getSystemTheme();
	return theme === "DARK" ? "dark" : "light";
}

// Get theme from cookie
export function getThemeCookie(): Theme | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp(`(^| )${THEME_COOKIE_NAME}=([^;]+)`));
	const value = match?.[2];
	if (value === "LIGHT" || value === "DARK" || value === "SYSTEM") return value;
	return null;
}

// Set theme cookie
export function setThemeCookie(theme: Theme): void {
	if (typeof document === "undefined") return;
	// Cookie expires in 1 year
	const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
	document.cookie = `${THEME_COOKIE_NAME}=${theme};expires=${expires};path=/;SameSite=Lax`;
}

// Apply theme to document
export function applyTheme(theme: Theme): void {
	const resolved = getResolvedTheme(theme);
	const root = document.documentElement;

	if (resolved === "dark") {
		root.classList.add("dark");
	} else {
		root.classList.remove("dark");
	}

	setThemeCookie(theme);
	themeStore.set(theme);
}

// Cycle to next theme
export function cycleTheme(current: Theme): Theme {
	const order: Theme[] = ["LIGHT", "DARK", "SYSTEM"];
	const currentIndex = order.indexOf(current);
	const nextIndex = (currentIndex + 1) % order.length;
	return order[nextIndex];
}

// Initialize theme from various sources
export function initializeTheme(serverTheme?: Theme | null): void {
	// Priority: cookie > server > system default
	const cookieTheme = getThemeCookie();
	const initialTheme = cookieTheme ?? serverTheme ?? "SYSTEM";

	applyTheme(initialTheme);

	// Listen for system theme changes when on SYSTEM
	if (typeof window !== "undefined") {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		mediaQuery.addEventListener("change", () => {
			const currentTheme = themeStore.get();
			if (currentTheme === "SYSTEM") {
				const resolved = getResolvedTheme("SYSTEM");
				const root = document.documentElement;
				if (resolved === "dark") {
					root.classList.add("dark");
				} else {
					root.classList.remove("dark");
				}
			}
		});
	}
}
