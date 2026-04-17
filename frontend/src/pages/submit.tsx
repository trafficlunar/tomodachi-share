import { useStore } from "@nanostores/react";
import SubmitForm from "../components/submit-form";
import { session } from "../session";
import { Navigate } from "react-router";

export default function SubmitPage() {
	const $session = useStore(session);
	if ($session === undefined) return <div className="p-6 text-center">Loading...</div>;
	if ($session === null) return <Navigate to="/login" replace />;
	return <SubmitForm />;
}
