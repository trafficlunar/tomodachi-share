import { useStore } from "@nanostores/react";
import MiiList from "../components/mii/list";
import { session } from "../session";
import { Navigate } from "react-router";

export default function AdminPage() {
	const $session = useStore(session);
	if ($session === undefined) return <div className="p-6 text-center">Loading...</div>;
	if ($session === null || Number($session?.user?.id) != import.meta.env.VITE_ADMIN_USER_ID) return <Navigate to="/404" replace />;
	return <MiiList parentPage="admin" />;
}
