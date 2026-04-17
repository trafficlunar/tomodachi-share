import { useStore } from "@nanostores/react";
import SubmitForm from "../components/submit-form";
import { session } from "../session";
import { Navigate } from "react-router";

export default function SubmitPage() {
	const $session = useStore(session);
	if (!$session) return <Navigate to="/login" replace />;
	return <SubmitForm />;
}
