import { handlers } from "@/lib/auth";

// Expose GET and POST for all Auth.js routes under /api/auth/*
export const { GET, POST } = handlers;
