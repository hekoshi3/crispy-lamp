import { useState } from "react";
import Image from "next/image";

export function BoardImg({ boardName }: { boardName: string }) {
    const [imgSrc, setImgSrc] = useState(`/images/boards/${boardName}.png`);
    const [triedJpg, setTriedJpg] = useState(false);
    return (
        <>
            <Image
                    className="boardimg"
                    src={imgSrc}
                    alt="board"
                    width={1489}
                    height={450}
                    priority
                    style={{ objectFit: "cover", objectPosition: "top" }}
                    onError={() => {
                        if (!triedJpg) {
                            setImgSrc(`/images/boards/${boardName}.jpg`);
                            setTriedJpg(true);
                        } else {
                            setImgSrc("/images/logo.png");
                        }
                    }}
                />                
            <h1 className="boardname-top">{boardName}</h1>

        </>
    );
}