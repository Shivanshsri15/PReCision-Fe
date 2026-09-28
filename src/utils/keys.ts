export const repoKey = (owner: string, repo: string) => `${owner}/${repo}`;

export const prKey = (owner: string, repo: string, number: number) => `${owner}/${repo}#${number}`;

export const indexKey = (owner: string, repo: string, branch: string) => `${owner}/${repo}@${branch}`;

export function splitRepoKey(key: string): { owner: string; repo: string } | null {
  const [owner, repo] = key.split('/');
  return owner && repo ? { owner, repo } : null;
}

export const prPath = (owner: string, repo: string, number: number) =>
  `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls/${number}`;
