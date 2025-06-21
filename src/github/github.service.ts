import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import pLimit from 'p-limit';

import { EnvironmentVariables } from '../config/env.schema';
import { RepoListItem } from './dtos/repo-list.output';
import { RepoDetails } from './dtos/repo-detail.output';
import { GithubRepo } from './interfaces/github-repo.interface';
import { GithubWebhook } from './interfaces/github-webhook.interface';
import { GitTreeResponse } from './interfaces/git-tree.interface';
import { GithubFile } from './interfaces/github-file.interface';
import { ErrorService } from '../error/error.service';

@Injectable()
export class GithubService {
  private readonly host: string;
  private readonly port: string;
  private readonly githubToken: string;
  private readonly owner: string;
  private readonly repositories: string[];

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly errorService: ErrorService,
  ) {
    this.host = this.configService.getOrThrow('HOST');
    this.port = this.configService.getOrThrow('PORT');
    this.githubToken = this.configService.getOrThrow('GITHUB_TOKEN');
    this.owner = this.configService.getOrThrow('OWNER');
    this.repositories = this.configService.getOrThrow('REPOSITORIES');
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.githubToken}`,
      Accept: 'application/vnd.github+json',
    };
  }

  private async getRepository(repo: string): Promise<RepoListItem> {
    const url = `https://api.github.com/repos/${this.owner}/${repo}`;
    try {
      const response = await lastValueFrom(
        this.http.get<GithubRepo>(url, { headers: this.getHeaders() }),
      );
      return {
        name: response.data.name,
        size: response.data.size,
        owner: response.data.owner.login,
      };
    } catch (error: unknown) {
      this.errorService.handle(error, `fetch repository ${repo}`);
    }
  }

  async getRepositories(): Promise<RepoListItem[]> {
    const limit = pLimit(2);
    try {
      return await Promise.all(
        this.repositories.map((repo) => limit(() => this.getRepository(repo))),
      );
    } catch (error: unknown) {
      this.errorService.handle(error, 'fetch selected repositories');
    }
  }

  async getFullRepositoryInfo(repo: string): Promise<RepoDetails> {
    try {
      const details = await this.getRepositoryDetails(repo);
      const allFiles = await this.getAllFilesFromRepo(repo);
      const yamlFile = this.findYamlFileFromList(allFiles);
      const ymlFileContent = yamlFile?.download_url
        ? await this.getFileContentByUrl(yamlFile.download_url)
        : undefined;

      return {
        ...details,
        numberOfFiles: allFiles.length,
        ymlFileContent,
      };
    } catch (error: unknown) {
      this.errorService.handle(error, 'get full repository info');
    }
  }

  private async getRepositoryDetails(
    repo: string,
  ): Promise<Omit<RepoDetails, 'numberOfFiles' | 'ymlFileContent'>> {
    const repoUrl = `https://api.github.com/repos/${this.owner}/${repo}`;
    const hooksUrl = `https://api.github.com/repos/${this.owner}/${repo}/hooks`;

    try {
      const [repoResponse, hooksResponse] = await Promise.all([
        lastValueFrom(
          this.http.get<GithubRepo>(repoUrl, {
            headers: this.getHeaders(),
          }),
        ),
        lastValueFrom(
          this.http.get<GithubWebhook[]>(hooksUrl, {
            headers: this.getHeaders(),
          }),
        ),
      ]);

      return {
        name: repoResponse.data.name,
        size: repoResponse.data.size,
        owner: repoResponse.data.owner.login,
        isPrivate: repoResponse.data.private,
        webhooks: hooksResponse.data.map((hook) => hook.config.url ?? ''),
      };
    } catch (error: unknown) {
      this.errorService.handle(error, `fetch repository details for "${repo}"`);
    }
  }

  private async getAllFilesFromRepo(repo: string): Promise<GithubFile[]> {
    const url = `https://api.github.com/repos/${this.owner}/${repo}/git/trees/HEAD?recursive=1`;

    try {
      const response = await lastValueFrom(
        this.http.get<GitTreeResponse>(url, {
          headers: this.getHeaders(),
        }),
      );

      if (response.data.truncated) {
        console.warn(
          'Warning: File tree truncated. Consider alternative method to get the files.',
        );
      }

      return response.data.tree
        .filter((item) => item.type === 'blob')
        .map((item) => ({
          name: item.path.split('/').pop() ?? '',
          path: item.path,
          type: 'file',
          download_url: `https://raw.githubusercontent.com/${this.owner}/${repo}/HEAD/${item.path}`,
        }));
    } catch (error: unknown) {
      this.errorService.handle(
        error,
        `fetch all files from repository "${repo}"`,
      );
    }
  }

  private findYamlFileFromList(files: GithubFile[]): GithubFile | undefined {
    return files.find(
      (file) =>
        file.name.toLowerCase().endsWith('.yml') ||
        file.name.toLowerCase().endsWith('.yaml'),
    );
  }

  private async getFileContentByUrl(url: string): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.http.get<string>(url, {
          responseType: 'text',
          headers: this.getHeaders(),
        }),
      );
      return response.data;
    } catch (error: unknown) {
      this.errorService.handle(error, 'fetch YAML file content from URL');
    }
  }
}
