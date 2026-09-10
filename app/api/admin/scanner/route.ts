import { createClient } from "@supabase/supabase-js";

// GitHub credentials stay server-side; the admin browser never receives them.

export const runtime = "nodejs";

const OWNER = process.env.SCANNER_GITHUB_OWNER || "fidelitytradershub";
const REPO = process.env.SCANNER_GITHUB_REPO || "fidelity-scanner";
const BRANCH = process.env.SCANNER_GITHUB_BRANCH || "main";
const ALLOWED_FILES = {
  levels: "levels_data.json",
  bias: "bias.json",
} as const;

type Resource = keyof typeof ALLOWED_FILES;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

async function requireAdmin(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!supabaseUrl || !supabaseAnonKey || !token) return false;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return false;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  return (
    !profileError &&
    (profile?.role === "admin" || profile?.role === "super_admin")
  );
}

function githubHeaders() {
  const token = process.env.SCANNER_GITHUB_TOKEN;
  if (!token) return null;
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function readGithubJson(resource: Resource) {
  const headers = githubHeaders();
  if (!headers) throw new Error("Scanner connection is not configured.");

  const path = ALLOWED_FILES[resource];
  const response = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`,
    { headers, cache: "no-store" },
  );
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status}).`);
  }
  const file = (await response.json()) as { content: string; sha: string };
  const text = Buffer.from(file.content.replace(/\n/g, ""), "base64").toString(
    "utf8",
  );
  return { data: JSON.parse(text) as unknown, sha: file.sha, path };
}

function isValidPayload(resource: Resource, value: unknown) {
  if (!value || typeof value !== "object") return false;
  if (resource === "levels") {
    return Array.isArray((value as { levels?: unknown }).levels);
  }
  const bias = value as { pairs?: unknown; settings?: unknown };
  return (
    !!bias.pairs &&
    typeof bias.pairs === "object" &&
    !!bias.settings &&
    typeof bias.settings === "object"
  );
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Admin access required.", 403);

  try {
    const [levels, bias] = await Promise.all([
      readGithubJson("levels"),
      readGithubJson("bias"),
    ]);
    return Response.json({ levels: levels.data, bias: bias.data });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Scanner load failed.", 502);
  }
}

export async function PUT(request: Request) {
  if (!(await requireAdmin(request))) return jsonError("Admin access required.", 403);

  try {
    const body = (await request.json()) as { resource?: Resource; data?: unknown };
    if (!body.resource || !(body.resource in ALLOWED_FILES)) {
      return jsonError("Invalid scanner resource.", 400);
    }
    if (!isValidPayload(body.resource, body.data)) {
      return jsonError("Invalid scanner data.", 400);
    }

    const headers = githubHeaders();
    if (!headers) return jsonError("Scanner connection is not configured.", 503);

    const current = await readGithubJson(body.resource);
    const content = Buffer.from(JSON.stringify(body.data, null, 2) + "\n").toString(
      "base64",
    );
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${current.path}`,
      {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          message:
            body.resource === "levels"
              ? "Update scanner levels from admin dashboard"
              : "Update scanner bias from admin dashboard",
          content,
          sha: current.sha,
          branch: BRANCH,
        }),
      },
    );
    if (!response.ok) {
      const details = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;
      throw new Error(details?.message || `GitHub update failed (${response.status}).`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Scanner update failed.", 502);
  }
}
