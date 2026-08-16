import type {AuthenticatedUser} from './auth/identities.js';

declare global {
  namespace Express {
    interface Request {auth: AuthenticatedUser | null}
  }
}

export {};
