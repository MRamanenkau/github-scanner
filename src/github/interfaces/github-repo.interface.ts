export interface GithubRepo {
  name: string;
  size: number;
  private: boolean;
  owner: {
    login: string;
  };
}
