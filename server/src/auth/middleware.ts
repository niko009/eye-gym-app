import type {NextFunction, Request, Response} from 'express';
import {readSession} from './sessions.js';

export async function loadSession(request: Request, _response: Response, next: NextFunction): Promise<void> {
  request.auth = await readSession(request);
  next();
}

export function requireSession(request: Request, response: Response, next: NextFunction): void {
  if (!request.auth) {
    response.status(401).json({error: 'authentication_required'});
    return;
  }
  next();
}
