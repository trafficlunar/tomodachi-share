import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import "@fontsource-variable/lexend/wght.css";

import PrivacyPage from "./pages/privacy.tsx";
import TermsOfServicePage from "./pages/terms-of-service.tsx";
import NotFoundPage from "./pages/not-found.tsx";
import LoginPage from "./pages/login.tsx";
import ProfilePage from "./pages/profile.tsx";
import MiiPage from "./pages/mii.tsx";
import SubmitPage from "./pages/submit.tsx";
import IndexPage from "./pages/index.tsx";
import ProfileSettingsPage from "./pages/settings.tsx";
import { ProgressProvider } from "@bprogress/react";
import LinkOutPage from "./pages/out.tsx";
import Layout from "./layout.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<ProgressProvider height="4px" color="var(--color-amber-500)" options={{ showSpinner: false }} shallowRouting>
				<Layout>
					<Routes>
						<Route path="/" element={<IndexPage />} />
						<Route path="/mii/:id" element={<MiiPage />} />
						<Route path="/profile">
							<Route path=":id" element={<ProfilePage />} />
							<Route path="settings" element={<ProfileSettingsPage />} />
						</Route>
						<Route path="/submit" element={<SubmitPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/out" element={<LinkOutPage />} />
						<Route path="/privacy" element={<PrivacyPage />} />
						<Route path="/terms-of-service" element={<TermsOfServicePage />} />
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</Layout>
			</ProgressProvider>
		</BrowserRouter>
	</StrictMode>,
);
