import { useParams } from "react-router";
import MiiList from "../../components/mii/list";
import { useStore } from "@nanostores/react";
import { session } from "../../session";

export default function ProfilePage() {
	const { id } = useParams();
	const $session = useStore(session);

	const userId = Number(id ?? $session?.user?.id);
	const isOwnProfile = !!$session?.user?.id && userId === Number($session.user.id);

	return <MiiList userId={Number(id)} bypassCache={isOwnProfile} />;
}
