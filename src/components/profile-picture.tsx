"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

export default function ProfilePicture(props: Partial<ImageProps>) {
	const { src, ...rest } = props;
	const [imgSrc, setImgSrc] = useState(src);

	return <Image {...rest} src={imgSrc || "/guest.webp"} alt={"profile picture"} width={128} height={128} onError={() => setImgSrc("/guest.webp")} />;
}
