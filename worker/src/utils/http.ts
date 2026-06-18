import type { VerifyResponse } from '../types';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function json(body: unknown, status = 200): Response {
	return Response.json(body, {
		status,
		headers: {
			...corsHeaders,
			'Content-Type': 'application/json; charset=utf-8',
		},
	});
}

export function html(body: string, status = 200): Response {
	return new Response(body, {
		status,
		headers: {
			...corsHeaders,
			'Content-Type': 'text/html; charset=utf-8',
		},
	});
}

export function options(): Response {
	return new Response(null, { status: 204, headers: corsHeaders });
}

export async function readJson<T>(request: Request): Promise<T> {
	return request.json() as Promise<T>;
}

export function denied(message: string, status = 200): Response {
	const body: VerifyResponse = {
		active: false,
		plan: 'free',
		features: [],
		expiresAt: '',
		message,
	};
	return json(body, status);
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
