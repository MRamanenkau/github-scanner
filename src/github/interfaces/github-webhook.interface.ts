export interface GithubWebhook {
  config: {
    url?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
