import { useStore } from "@nanostores/react";
import AdminBanner from "./components/admin/banner";
import Footer from "./components/footer";
import Header from "./components/header";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { session } from "./session";

export default function Layout({ children }: { children: React.ReactNode }) {
	const $session = useStore(session);
	const navigate = useNavigate();
	const location = useLocation();

	const API_URL = import.meta.env.VITE_API_URL;

	// Calculate header height
	useEffect(() => {
		const header = document.querySelector("header");
		if (!header) return;

		const updateHeaderHeight = () => {
			document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
		};

		const resizeObserver = new ResizeObserver(updateHeaderHeight);
		resizeObserver.observe(header);
		window.addEventListener("resize", updateHeaderHeight);

		updateHeaderHeight();

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateHeaderHeight);
		};
	}, []);

	// Check for punishment on every page navigation
	useEffect(() => {
		if (!$session) return;
		if (["/punished", "/terms-of-service", "/privacy"].includes(location.pathname)) return;

		fetch(`${API_URL}/api/is-punished`, { credentials: "include" })
			.then((res) => {
				if (!res.ok) return null;
				return res.json();
			})
			.then((data) => {
				if (data.isPunished) navigate("/punished", { replace: true });
			})
			.catch((err) => {
				console.error("Failed to check punishment status:", err);
			});
	}, [$session, location.pathname]);

	return (
		<>
			<Header />
			<AdminBanner />
			<main className="px-4 py-8 max-w-7xl w-full grow flex flex-col">{children}</main>
			<Footer />
		</>
	);
}
