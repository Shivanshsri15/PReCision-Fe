import type { PullRequestFile } from '../../types/github';
import type { Finding } from '../../types/review';

export interface DemoScenario {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  pullNumber: number;
  title: string;
  summary: string;
  indexFiles: string[];
  files: PullRequestFile[];
  findings: Finding[];
}

function file(
  filename: string,
  patch: string,
  status: PullRequestFile['status'] = 'modified',
): PullRequestFile {
  const additions = patch.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')).length;
  const deletions = patch.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---')).length;
  return {
    sha: filename,
    filename,
    status,
    additions,
    deletions,
    changes: additions + deletions,
    patch,
  };
}

const SECURITY: DemoScenario = {
  id: 'security-secret',
  owner: 'acme-labs',
  repo: 'checkout-api',
  branch: 'main',
  pullNumber: 42,
  title: 'Add JWT auth middleware for checkout routes',
  summary:
    'Security agent flagged a hardcoded signing secret; quality noted missing input validation on the token path.',
  indexFiles: [
    'src/auth/jwt.ts',
    'src/auth/middleware.ts',
    'src/checkout/routes.ts',
    'src/config/env.ts',
    'package.json',
  ],
  files: [
    file(
      'src/auth/jwt.ts',
      [
        '@@ -1,4 +1,12 @@',
        ' export function signToken(userId: string) {',
        "-  const secret = process.env.JWT_SECRET;",
        "+  const secret = 'super-secret-key-do-not-share';",
        '+  return jwt.sign({ sub: userId }, secret, { expiresIn: "1h" });',
        ' }',
        '+',
        '+export function verifyToken(token: string) {',
        '+  return jwt.verify(token, secret);',
        '+}',
      ].join('\n'),
    ),
    file(
      'src/auth/middleware.ts',
      [
        '@@ -8,6 +8,14 @@',
        ' export function requireAuth(req, res, next) {',
        '+  const header = req.headers.authorization;',
        '+  if (!header) {',
        '+    throw new Error("missing auth");',
        '+  }',
        '+  const token = header.slice(7);',
        '+  req.user = verifyToken(token);',
        '+  next();',
        ' }',
      ].join('\n'),
      'added',
    ),
  ],
  findings: [
    {
      file: 'src/auth/jwt.ts',
      line: 2,
      severity: 'high',
      domain: 'security',
      issue: 'Hardcoded JWT signing secret in source. Anyone with repo access can forge tokens.',
      suggestion: 'Load the secret from an environment variable or a secrets manager; never commit it.',
    },
    {
      file: 'src/auth/jwt.ts',
      line: 7,
      severity: 'medium',
      domain: 'quality',
      issue: 'verifyToken shares a module-level secret with no null check if env is misconfigured.',
      suggestion: 'Fail fast at startup when JWT_SECRET is missing instead of signing with a fallback.',
    },
    {
      file: 'src/auth/middleware.ts',
      line: 11,
      severity: 'low',
      domain: 'bugDetection',
      issue: 'Missing Authorization header throws instead of returning 401.',
      suggestion: 'Return 401 Unauthorized when the header is absent or malformed.',
    },
  ],
};

const PERFORMANCE: DemoScenario = {
  id: 'perf-n-plus-one',
  owner: 'acme-labs',
  repo: 'orders-service',
  branch: 'main',
  pullNumber: 18,
  title: 'Enrich order list with customer and item details',
  summary:
    'Performance agent found an N+1 query pattern; bug detection noted a missing pagination guard.',
  indexFiles: [
    'src/orders/list.ts',
    'src/orders/repository.ts',
    'src/customers/client.ts',
    'src/db/pool.ts',
  ],
  files: [
    file(
      'src/orders/list.ts',
      [
        '@@ -1,6 +1,14 @@',
        ' export async function listOrders(userId: string) {',
        '   const orders = await db.query("SELECT * FROM orders WHERE user_id = $1", [userId]);',
        '+  const enriched = [];',
        '+  for (const order of orders.rows) {',
        '+    const customer = await customers.get(order.customer_id);',
        '+    const items = await db.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);',
        '+    enriched.push({ ...order, customer, items: items.rows });',
        '+  }',
        '+  return enriched;',
        ' }',
      ].join('\n'),
    ),
    file(
      'src/orders/repository.ts',
      [
        '@@ -1,3 +1,8 @@',
        '+export async function countOrders(userId: string) {',
        '+  const result = await db.query("SELECT count(*) FROM orders WHERE user_id = $1", [userId]);',
        '+  return Number(result.rows[0].count);',
        '+}',
      ].join('\n'),
      'modified',
    ),
  ],
  findings: [
    {
      file: 'src/orders/list.ts',
      line: 4,
      severity: 'high',
      domain: 'performance',
      issue: 'N+1 queries: one customer fetch and one items query per order will not scale.',
      suggestion: 'Batch-load customers and items with WHERE id IN (...) or a single JOIN query.',
    },
    {
      file: 'src/orders/list.ts',
      line: 2,
      severity: 'medium',
      domain: 'bugDetection',
      issue: 'Unbounded SELECT * with no LIMIT; large accounts can OOM the process.',
      suggestion: 'Add cursor or offset pagination and a hard max page size.',
    },
    {
      file: 'src/orders/list.ts',
      line: 5,
      severity: 'low',
      domain: 'quality',
      issue: 'Loop mutates a local array with push; harder to test than map + Promise.all.',
      suggestion: 'Prefer Promise.all over sequential awaits once batching is in place.',
    },
  ],
};

const QUALITY: DemoScenario = {
  id: 'quality-null',
  owner: 'acme-labs',
  repo: 'profile-web',
  branch: 'main',
  pullNumber: 7,
  title: 'Show avatar initials when profile photo is missing',
  summary:
    'Bug detection caught a null dereference on optional profile fields; quality suggested clearer fallbacks.',
  indexFiles: [
    'src/components/Avatar.tsx',
    'src/hooks/useProfile.ts',
    'src/api/profile.ts',
    'src/types/user.ts',
  ],
  files: [
    file(
      'src/components/Avatar.tsx',
      [
        '@@ -1,8 +1,12 @@',
        ' export function Avatar({ user }: { user: User }) {',
        '+  if (user.avatarUrl) {',
        '+    return <img src={user.avatarUrl} alt={user.name} />;',
        '+  }',
        '+  const initials = user.name.split(" ").map((p) => p[0]).join("");',
        '+  return <span className="avatar-fallback">{initials.toUpperCase()}</span>;',
        ' }',
      ].join('\n'),
    ),
    file(
      'src/hooks/useProfile.ts',
      [
        '@@ -10,6 +10,11 @@',
        ' export function useProfile(userId: string) {',
        '+  useEffect(() => {',
        '+    void api.getProfile(userId).then(setProfile);',
        '+  }, [userId]);',
        '   return profile;',
        ' }',
      ].join('\n'),
    ),
  ],
  findings: [
    {
      file: 'src/components/Avatar.tsx',
      line: 5,
      severity: 'high',
      domain: 'bugDetection',
      issue: 'user.name can be null/undefined for incomplete profiles; .split will throw.',
      suggestion: 'Guard with (user.name ?? user.email ?? "?").trim() before splitting.',
    },
    {
      file: 'src/components/Avatar.tsx',
      line: 3,
      severity: 'medium',
      domain: 'quality',
      issue: 'alt text uses user.name which may be empty, hurting accessibility.',
      suggestion: 'Use a stable label like `Avatar for ${user.email}` when name is missing.',
    },
    {
      file: 'src/hooks/useProfile.ts',
      line: 12,
      severity: 'low',
      domain: 'performance',
      issue: 'Profile refetch on every Avatar mount; sibling avatars duplicate the request.',
      suggestion: 'Lift profile fetch to a shared cache or React Query key.',
    },
  ],
};

export const DEMO_SCENARIOS: DemoScenario[] = [SECURITY, PERFORMANCE, QUALITY];

const STORAGE_KEY = 'precision-demo-scenario-id';

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Picks a scenario for this session; stable across refresh until the tab is closed. */
export function pickDemoScenario(): DemoScenario {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  const base =
    DEMO_SCENARIOS.find((s) => s.id === saved) ??
    DEMO_SCENARIOS[Math.floor(Math.random() * DEMO_SCENARIOS.length)]!;
  sessionStorage.setItem(STORAGE_KEY, base.id);
  return { ...base, findings: shuffle(base.findings) };
}

export function resetDemoScenarioPick() {
  sessionStorage.removeItem(STORAGE_KEY);
}
