/**
 * Delhi Public School Indirapuram (DPSI) — Serverless API Architecture
 * Copyright (c) 2026 DPS Indirapuram Portal Architecture. All rights reserved.
 * Bespoke implementation designed for high-performance multi-tenant educational portals.
 */

import app from './boot';

/**
 * Custom Vercel Serverless Function Dispatcher.
 * Converts incoming Node.js (req, res) streams to standard Web Request/Response objects
 * and dispatches them to Hono's app.fetch with zero stream hangs or timeout deadlocks.
 */
export default async function handler(req: any, res: any) {
  try {
    // 1. Buffer the incoming Node stream safely (capped at 20MB to prevent memory exhaustion)
    const MAX_BUFFER_BYTES = 20 * 1024 * 1024;
    let totalBytes = 0;
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      totalBytes += buf.length;
      if (totalBytes > MAX_BUFFER_BYTES) {
        res.statusCode = 413;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Payload Too Large" }));
        return;
      }
      chunks.push(buf);
    }
    const bodyBuffer = Buffer.concat(chunks);

    // 2. Build absolute URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
    const fullUrl = new URL(req.url, `${protocol}://${host}`).href;

    // 3. Construct standard Web Headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value as string);
        }
      }
    }

    // 4. Construct standard Web Request
    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method?.toUpperCase() || '') && bodyBuffer.length > 0;
    const webReq = new Request(fullUrl, {
      method: req.method,
      headers,
      body: hasBody ? bodyBuffer : undefined,
      // @ts-ignore
      duplex: hasBody ? 'half' : undefined,
    });

    // 5. Dispatch to Hono
    const webRes = await app.fetch(webReq);

    // 6. Return response to Node ServerResponse
    res.statusCode = webRes.status;
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const resArrayBuffer = await webRes.arrayBuffer();
    res.end(Buffer.from(resArrayBuffer));
  } catch (err: any) {
    console.error('[Handler Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: err?.message || 'Internal Server Error' }));
    }
  }
}
