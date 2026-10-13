import type { WindowDefinition } from "../../data/portfolio";
import Icon from "./Icon";

interface Props {
	definition: WindowDefinition;
	onOpen: () => void;
	onSelect: () => void;
	isOpen: boolean;
	selected: boolean;
}

export default function DesktopIcon({
	definition,
	onOpen,
	onSelect,
	isOpen,
	selected,
}: Props) {
	return (
		<button
			type="button"
			id={`desktop-${definition.id}`}
			className={`desktop-icon ${selected ? "is-selected" : ""} ${isOpen ? "is-open" : ""}`}
			aria-label={`Open ${definition.title}`}
			aria-describedby="desktop-instructions"
			onDoubleClick={onOpen}
			onClick={(event) => {
				// Keyboard activation produces a click with detail 0.
				if (event.detail === 0) onOpen();
				else onSelect();
			}}
			onPointerUp={(event) => {
				if (event.pointerType === "touch" || event.pointerType === "pen")
					onOpen();
			}}
		>
			<span className="icon-tile">
				<Icon kind={definition.icon} />
			</span>
			<span className="icon-label">{definition.title}</span>
		</button>
	);
}
