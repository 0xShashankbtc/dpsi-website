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
    const method = (req.method || 'GET').toUpperCase();
    const isBodyMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    // 1. Buffer incoming stream only for body-bearing HTTP methods (capped at 20MB)
    let bodyBuffer: Buffer | undefined = undefined;
    if (isBodyMethod) {
      if (Buffer.isBuffer(req.body)) {
        bodyBuffer = req.body;
      } else if (typeof req.body === 'string') {
        bodyBuffer = Buffer.from(req.body);
      } else if (req.body && typeof req.body === 'object') {
        bodyBuffer = Buffer.from(JSON.stringify(req.body));
      } else if (req[Symbol.asyncIterator]) {
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
        bodyBuffer = Buffer.concat(chunks);
      }
    }

    // 2. Build absolute URL — recover original path if Vercel rewrote internally to /api/index.js
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';

    let pathAndQuery = req.headers['x-forwarded-url'] || req.url || '/';
    if (pathAndQuery.startsWith('/api/index.js') || pathAndQuery.startsWith('/api/index')) {
      const matched = req.headers['x-matched-path'];
      if (matched) {
        const queryIdx = (req.url || '').indexOf('?');
        const query = queryIdx !== -1 ? (req.url || '').slice(queryIdx) : '';
        pathAndQuery = (matched.startsWith('/') ? matched : `/${matched}`) + query;
      }
    }
    const fullUrl = new URL(pathAndQuery, `${protocol}://${host}`).href;

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
    const hasBody = isBodyMethod && bodyBuffer && bodyBuffer.length > 0;
    const webReq = new Request(fullUrl, {
      method,
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
