import { type ReactNode, useRef } from "react";
import {
	interests,
	type WindowDefinition,
	type WindowId,
	windowDefinitions,
} from "../../data/portfolio";
import Icon, { AppIcon } from "./Icon";
import type { WindowState } from "./windowManager";

interface Props {
	windows: WindowState;
	active: WindowId | undefined;
	onSelect: (id: WindowId) => void;
}

function actionLabel(
	windows: WindowState,
	active: WindowId | undefined,
	id: WindowId,
	title: string,
) {
	const window = windows.find((entry) => entry.id === id);
	if (!window) return `Open ${title}`;
	if (window.minimized) return `Restore ${title}`;
	return `${active === id ? "Minimize" : "Show"} ${title}`;
}

function DockItem({
	id,
	label,
	tooltip,
	running,
	pressed,
	onClick,
	children,
}: {
	id?: string;
	label: string;
	tooltip: string;
	running: boolean;
	pressed?: boolean;
	onClick: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			id={id}
			className="dock-item"
			aria-label={label}
			aria-pressed={pressed}
			onClick={onClick}
		>
			<span className="dock-tooltip" aria-hidden="true">
				{tooltip}
			</span>
			<span className="dock-icon">{children}</span>
			<span className={`dock-indicator ${running ? "is-running" : ""}`} />
		</button>
	);
}

const MAGNIFY_RANGE = 140;
const MAGNIFY_AMOUNT = 0.55;

export default function Dock({ windows, active, onSelect }: Props) {
	const dock = useRef<HTMLDivElement>(null);
	const openSections = windowDefinitions.filter((definition) =>
		windows.some((window) => window.id === definition.id),
	);

	function magnify(pointerX?: number) {
		for (const item of dock.current?.querySelectorAll<HTMLElement>(
			".dock-item",
		) ?? []) {
			if (pointerX === undefined) {
				item.style.removeProperty("--scale");
				continue;
			}
			const box = item.getBoundingClientRect();
			const distance = Math.abs(pointerX - (box.left + box.width / 2));
			const scale =
				1 + MAGNIFY_AMOUNT * Math.max(0, 1 - distance / MAGNIFY_RANGE) ** 2;
			item.style.setProperty("--scale", scale.toFixed(3));
		}
	}

	const sectionItem = (definition: WindowDefinition) => {
		const window = windows.find((entry) => entry.id === definition.id);
		return (
			<DockItem
				key={definition.id}
				label={actionLabel(windows, active, definition.id, definition.title)}
				tooltip={definition.title}
				running
				pressed={active === definition.id}
				onClick={() => onSelect(definition.id)}
			>
				<span
					className={`dock-window ${window?.minimized ? "is-minimized" : ""}`}
				>
					<Icon kind={definition.icon} />
				</span>
			</DockItem>
		);
	};

	return (
		<footer className="dock-container">
			<div
				className="dock"
				ref={dock}
				onPointerMove={(event) => {
					if (event.pointerType === "mouse") magnify(event.clientX);
				}}
				onPointerLeave={() => magnify()}
			>
				<nav className="dock-section" aria-label="Interests">
					{interests.map((app) => (
						<DockItem
							key={app.id}
							id={`dock-${app.id}`}
							label={actionLabel(windows, active, app.id, app.title)}
							tooltip={app.title}
							running={windows.some((window) => window.id === app.id)}
							onClick={() => onSelect(app.id)}
						>
							<AppIcon app={app} />
						</DockItem>
					))}
				</nav>
				{openSections.length > 0 && (
					<span className="dock-separator" aria-hidden="true" />
				)}
				<nav className="dock-section" aria-label="Open windows">
					{openSections.map(sectionItem)}
				</nav>
			</div>
		</footer>
	);
}
