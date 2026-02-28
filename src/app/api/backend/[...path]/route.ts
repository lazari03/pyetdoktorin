import { NextRequest, NextResponse } from 'next/server';

const backendBaseUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:4000';

const normalizeBaseUrl = (base: string) => base.replace(/\/$/, '');

async function proxyRequest(req: NextRequest, params: { path?: string[] }) {
  const base = normalizeBaseUrl(backendBaseUrl);
  const path = params.path?.join('/') ?? '';
  const url = new URL(`${base}/${path}`);
  url.search = req.nextUrl.search;

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');
  headers.delete('content-length');

  const method = req.method.toUpperCase();
  const body =
    method === 'GET' || method === 'HEAD' ? undefined : await req.arrayBuffer();

  const backendRes = await fetch(url.toString(), {
    method,
    headers,
    body: body && body.byteLength > 0 ? body : undefined,
    redirect: 'manual',
  });

  const responseHeaders = new Headers(backendRes.headers);
  responseHeaders.delete('transfer-encoding');
  responseHeaders.delete('content-encoding');

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(req, context.params);
}

export async function POST(req: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(req, context.params);
}

export async function PUT(req: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(req, context.params);
}

export async function PATCH(req: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(req, context.params);
}

export async function DELETE(req: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(req, context.params);
}

export async function OPTIONS(req: NextRequest, context: { params: { path?: string[] } }) {
  return proxyRequest(req, context.params);
}
