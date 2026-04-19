import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import "react-image-crop/dist/ReactCrop.css";
import "@fontsource-variable/lexend/wght.css";

import PrivacyPage from "./pages/privacy.tsx";
import TermsOfServicePage from "./pages/terms-of-service.tsx";
import NotFoundPage from "./pages/not-found.tsx";
import LoginPage from "./pages/login.tsx";
import ProfilePage from "./pages/profile";
import MiiPage from "./pages/mii.tsx";
import SubmitPage from "./pages/submit.tsx";
import IndexPage from "./pages/index.tsx";
import ProfileSettingsPage from "./pages/profile/settings.tsx";
import { ProgressProvider } from "@bprogress/react";
import LinkOutPage from "./pages/out.tsx";
import Layout from "./layout.tsx";
import ProfileLayout from "./pages/profile/layout.tsx";
import ProfileLikesPage from "./pages/profile/likes.tsx";
import ReportMiiPage from "./pages/report/mii.tsx";
import ReportUserPage from "./pages/report/user.tsx";
import AdminPage from "./pages/admin.tsx";
import EditMiiPage from "./pages/edit.tsx";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<ProgressProvider height="4px" color="var(--color-amber-500)" options={{ showSpinner: false }} shallowRouting>
				<Layout>
					<Routes>
						<Route path="/" element={<IndexPage />} />
						<Route path="/mii/:id" element={<MiiPage />} />
						<Route path="/edit/:id" element={<EditMiiPage />} />
						<Route path="/profile" element={<ProfileLayout />}>
							<Route path=":id" element={<ProfilePage />} />
							<Route path="likes" element={<ProfileLikesPage />} />
							<Route path="settings" element={<ProfileSettingsPage />} />
						</Route>
						<Route path="/submit" element={<SubmitPage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/report">
							<Route path="mii/:id" element={<ReportMiiPage />} />
							<Route path="profile/:id" element={<ReportUserPage />} />
						</Route>
						<Route path="/out" element={<LinkOutPage />} />
						<Route path="/privacy" element={<PrivacyPage />} />
						<Route path="/terms-of-service" element={<TermsOfServicePage />} />
						<Route path="/admin" element={<AdminPage />} />
						<Route path="*" element={<NotFoundPage />} />
					</Routes>
				</Layout>
			</ProgressProvider>
		</BrowserRouter>
	</StrictMode>,
);
