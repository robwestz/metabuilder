
export interface StrictJSONRequest {
  schema: Record<string, unknown>;
  prompt: string;
}
export interface StrictJSONResponse {
  ok: boolean;
  json: unknown;
}
export async function strictJson(_req: StrictJSONRequest): Promise<StrictJSONResponse> {
  // Stub: return echo under schema
  return { ok: true, json: { message: "stub", note: "LLM offline" } };
}
