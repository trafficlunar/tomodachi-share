import { useStore } from "@nanostores/react";
import SubmitForm from "../components/submit-form";
import { session } from "../session";
import { useNavigate } from "react-router";

export default function SubmitPage() {
	const navigate = useNavigate();
	const $session = useStore(session);

	if (!$session) navigate("/login");
	return <SubmitForm />;
}
