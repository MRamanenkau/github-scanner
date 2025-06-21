export interface GithubFile {
  path: string;
  name: string;
  type: 'file' | 'dir';
  download_url?: string;
}
