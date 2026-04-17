import { Icon } from "@iconify/react";
import DeleteMiiButton from "./delete-mii-button";
import { Link } from "react-router";

interface Props {
	mii: any;
}

export default function AuthorButtons({ mii }: Props) {
	// const session = useSession();

	// if (!session.data || (Number(session.data.user?.id) !== mii.userId && Number(session.data.user?.id) !== Number(import.meta.env.NEXT_PUBLIC_ADMIN_USER_ID)))
	// 	return null;

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
