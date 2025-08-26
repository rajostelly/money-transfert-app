// Server-only module marker
// This ensures that the module is only loaded on the server side

if (typeof window !== "undefined") {
  throw new Error("This module should only be imported on the server side");
}

export {};
