import { useEffect, useState } from "react";

function Clock() {
	const [now, setNow] = useState<Date>();
	useEffect(() => {
		setNow(new Date());
		const timer = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);
	return (
		<time className="clock" dateTime={now?.toISOString()}>
			{now
				? `${now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}  ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
				: "\u00a0"}
		</time>
	);
}

export default function MenuBar({ appName }: { appName: string }) {
	return (
		<header className="menu-bar">
			<div className="menu-bar-left">
				<span className="menu-logo" aria-hidden="true">
					&gt;_
				</span>
				<span className="menu-app-name">{appName}</span>
				<span className="menu-item" aria-hidden="true">
					File
				</span>
				<span className="menu-item" aria-hidden="true">
					View
				</span>
				<span className="menu-item" aria-hidden="true">
					Window
				</span>
			</div>
			<div className="menu-bar-right">
				<svg viewBox="0 0 20 20" aria-hidden="true" className="menu-status">
					<path d="M2.5 8a11 11 0 0 1 15 0M5 10.8a7.3 7.3 0 0 1 10 0M7.6 13.5a3.6 3.6 0 0 1 4.8 0" />
					<circle cx="10" cy="16" r="1.2" />
				</svg>
				<svg
					viewBox="0 0 28 14"
					aria-hidden="true"
					className="menu-status battery"
				>
					<rect x="1" y="1.5" width="22" height="11" rx="3" />
					<rect
						x="3"
						y="3.5"
						width="15"
						height="7"
						rx="1.5"
						className="battery-level"
					/>
					<path d="M25 5.5v3" />
				</svg>
				<Clock />
			</div>
		</header>
	);
}
