import { Resolver, Query, Args } from '@nestjs/graphql';
import { GithubService } from './github.service';
import { RepoListItem } from './dtos/repo-list.output';
import { RepoDetails } from './dtos/repo-detail.output';

@Resolver()
export class GithubResolver {
  constructor(private readonly githubService: GithubService) {}

  @Query(() => [RepoListItem])
  async listRepositories() {
    return this.githubService.getRepositories();
  }

  @Query(() => RepoDetails)
  async repositoryDetails(@Args('repo') repo: string) {
    return this.githubService.getFullRepositoryInfo(repo);
  }
}
