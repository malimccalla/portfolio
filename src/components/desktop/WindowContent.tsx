import type { ReactNode } from "react";

export default function WindowContent({ content }: { content?: ReactNode }) {
	return content ?? <p role="alert">Content is unavailable for this window.</p>;
}
