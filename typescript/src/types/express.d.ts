import { AuthPayload } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// Empty export makes this file a module, which is required for
// `declare global` augmentation to be picked up by TypeScript.
export {};
