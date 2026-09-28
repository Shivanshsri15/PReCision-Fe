export interface User {
  _id: string;
  email: string;
  provider: 'github';
  githubId?: string;
  githubUsername?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GithubProfile {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  email: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GeminiKeyStatus {
  configured: boolean;
  envFallback?: boolean;
}
