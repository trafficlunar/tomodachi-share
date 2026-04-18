import { Icon } from "@iconify/react";
import DeleteMiiButton from "./delete-mii-button";
import { Link } from "react-router";
import { useStore } from "@nanostores/react";
import { session } from "../../session";

interface Props {
	mii: any;
}

export default function AuthorButtons({ mii }: Props) {
	const $session = useStore(session);
	if ($session === undefined) return null;
	if ($session === null) return null;
	if (Number($session?.user?.id) !== mii.userId && Number($session?.user?.id) !== Number(import.meta.env.VITE_ADMIN_USER_ID)) return null;

	return (
		<>
			<Link aria-label="Edit Mii" to={`/edit/${mii.id}`}>
				<Icon icon="mdi:pencil" />
				<span>Edit</span>
			</Link>
			<DeleteMiiButton miiId={mii.id} miiName={mii.name} likes={mii._count.likedBy ?? 0} inMiiPage />
		</>
	);
}
