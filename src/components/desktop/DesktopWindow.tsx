import type { CSSProperties, ReactNode } from "react";
import type { WindowDefinition } from "../../data/portfolio";
import Icon from "./Icon";

interface Props {
	definition: WindowDefinition;
	active: boolean;
	hidden: boolean;
	stack: number;
	position: number;
	onActivate: () => void;
	onClose: () => void;
	onMinimize: () => void;
	children: ReactNode;
}

export default function DesktopWindow({
	definition,
	active,
	hidden,
	stack,
	position,
	onActivate,
	onClose,
	onMinimize,
	children,
}: Props) {
	const style: CSSProperties & { "--window-offset": string } = {
		zIndex: stack,
		"--window-offset": `${position * 24}px`,
	};
	return (
		<section
			role="dialog"
			aria-labelledby={`title-${definition.id}`}
			className={`desktop-window ${active ? "is-active" : ""}`}
			style={style}
			hidden={hidden}
			onFocusCapture={onActivate}
			onPointerDownCapture={(event) => {
				onActivate();
				if (
					event.target instanceof Element &&
					!event.target.closest("button, a, input, textarea, select")
				) {
					event.currentTarget.querySelector<HTMLElement>("h2")?.focus();
				}
			}}
		>
			<header className="window-titlebar">
				<Icon kind={definition.icon} />
				<h2 id={`title-${definition.id}`} tabIndex={-1}>
					{definition.title}
				</h2>
				<div className="window-controls">
					<button
						type="button"
						aria-label={`Minimize ${definition.title}`}
						onClick={onMinimize}
					>
						<svg viewBox="0 0 20 20" aria-hidden="true">
							<path d="M5 13h10" />
						</svg>
					</button>
					<button
						type="button"
						className="close-control"
						aria-label={`Close ${definition.title}`}
						onClick={onClose}
					>
						<svg viewBox="0 0 20 20" aria-hidden="true">
							<path d="m6 6 8 8m0-8-8 8" />
						</svg>
					</button>
				</div>
			</header>
			<div className="window-path">
				<span>workspace</span>
				<span aria-hidden="true">/</span>
				<span>{definition.id}</span>
			</div>
			<div className="window-body">{children}</div>
			<footer className="window-footer">
				<span>{definition.description}</span>
				<span className="keyboard-hint">ESC to close</span>
			</footer>
		</section>
	);
}
