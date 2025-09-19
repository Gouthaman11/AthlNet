import React from "react";
import { createRoot } from "react-dom/client";

function renderErrorToDOM(message, stack) {
	try {
		const rootEl = document.getElementById('root');
		if (!rootEl) return;
		rootEl.innerHTML = `
			<div style="padding:24px;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;">
				<h2 style="color:#b91c1c">Application error</h2>
				<pre style="white-space:pre-wrap;color:#111;background:#fee2e2;padding:12px;border-radius:6px;">${escapeHtml(message)}\n${escapeHtml(stack || '')}</pre>
				<p style="color:#6b7280">Check the browser console for more details.</p>
			</div>
		`;
	} catch (e) {
		// ignore
	}
}

function escapeHtml(str = ''){
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const container = document.getElementById("root");
if (!container) {
	// If root element is missing, create a visible error
	const body = document.body || document.documentElement;
	const el = document.createElement('div');
	el.innerText = 'Root element not found (expected #root)';
	el.style.padding = '20px';
	el.style.color = 'red';
	body.insertBefore(el, body.firstChild);
} else {
	// Global error handlers to surface runtime errors to the DOM
	window.addEventListener('error', (event) => {
		console.error('Unhandled error:', event.error || event.message, event);
		renderErrorToDOM(event.message || 'Unhandled error', event.error?.stack || '');
	});

	window.addEventListener('unhandledrejection', (event) => {
		console.error('Unhandled rejection:', event.reason);
		const msg = event.reason?.message || String(event.reason);
		renderErrorToDOM(msg, event.reason?.stack || '');
	});

	// Dynamically import styles and App after handlers are installed so any module
	// evaluation errors are caught and can be displayed instead of a white screen.
	(async function bootstrap() {
		try {
			await import('./styles/tailwind.css');
			await import('./styles/index.css');
			const { default: App } = await import('./App');
			const root = createRoot(container);
			root.render(<App />);
		} catch (err) {
			console.error('Bootstrap failed:', err);
			renderErrorToDOM(err.message || 'Bootstrap failed', err.stack || '');
		}
	})();
}
