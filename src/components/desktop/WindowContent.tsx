import type { ReactNode } from "react";
import type { WindowId } from "../../data/portfolio";

export default function WindowContent({
	id,
	content,
	onOpen,
}: {
	id: WindowId;
	content?: ReactNode;
	onOpen: (id: WindowId) => void;
}) {
	return (
		<>
			{content ?? <p role="alert">Content is unavailable for this window.</p>}
			{id === "about" && (
				<button
					type="button"
					className="text-action"
					onClick={() => onOpen("resume")}
				>
					Open resume <span aria-hidden="true">↗</span>
				</button>
			)}
		</>
	);
}
