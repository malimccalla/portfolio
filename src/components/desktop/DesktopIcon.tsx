import type { WindowDefinition } from "../../data/portfolio";
import Icon from "./Icon";

interface Props {
	definition: WindowDefinition;
	onOpen: () => void;
	isOpen: boolean;
}

export default function DesktopIcon({ definition, onOpen, isOpen }: Props) {
	return (
		<button
			type="button"
			id={`desktop-${definition.id}`}
			className="desktop-icon"
			aria-label={`Open ${definition.title}`}
			aria-describedby="desktop-instructions"
			onDoubleClick={onOpen}
			onClick={(event) => {
				if (event.detail === 0) onOpen();
			}}
			onPointerUp={(event) => {
				if (event.pointerType === "touch" || event.pointerType === "pen")
					onOpen();
			}}
		>
			<span className="icon-tile">
				<Icon kind={definition.icon} />
				<span className={`icon-status ${isOpen ? "is-open" : ""}`} />
			</span>
			<span>{definition.title}</span>
		</button>
	);
}
