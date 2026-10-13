import { useEffect, useState } from "react";
import { type WindowId, windowDefinitions } from "../../data/portfolio";
import Icon from "./Icon";
import type { WindowState } from "./windowManager";

function Clock() {
	const [now, setNow] = useState<Date>();
	useEffect(() => {
		setNow(new Date());
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);
	return (
		<time className="clock" dateTime={now?.toISOString()}>
			<span>
				{now
					? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
					: "--:--"}
			</span>
			<span className="clock-date">
				{now
					? now.toLocaleDateString([], { month: "short", day: "numeric" })
					: "Local time"}
			</span>
		</time>
	);
}

interface Props {
	windows: WindowState;
	active: WindowId | undefined;
	onSelect: (id: WindowId) => void;
	onStart: () => void;
}

export default function Taskbar({ windows, active, onSelect, onStart }: Props) {
	return (
		<footer className="taskbar">
			<button
				type="button"
				className="start-button"
				aria-label="Open workspace overview"
				onClick={onStart}
			>
				<Icon kind="shield" />
				<span>Workspace</span>
			</button>
			<nav className="taskbar-windows" aria-label="Open windows">
				{windowDefinitions
					.filter((definition) =>
						windows.some((window) => window.id === definition.id),
					)
					.map((definition) => {
						const minimized = windows.find(
							(window) => window.id === definition.id,
						)?.minimized;
						return (
							<button
								key={definition.id}
								type="button"
								className={`taskbar-entry ${active === definition.id ? "is-active" : ""}`}
								aria-label={`${minimized ? "Restore" : active === definition.id ? "Minimize" : "Show"} ${definition.title}`}
								aria-pressed={active === definition.id}
								onClick={() => onSelect(definition.id)}
							>
								<Icon kind={definition.icon} />
								<span>{definition.title}</span>
								<span className="taskbar-indicator" />
							</button>
						);
					})}
				{windows.length === 0 && (
					<span className="taskbar-idle">
						Your workspace, ready to explore.
					</span>
				)}
			</nav>
			<div className="taskbar-status">
				<span className="local-label">
					<span className="status-dot" /> LOCAL
				</span>
				<Clock />
			</div>
		</footer>
	);
}
