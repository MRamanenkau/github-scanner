import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubResolver } from './github.resolver';
import { HttpModule } from '@nestjs/axios';
import { ErrorModule } from '../error/error.module';

@Module({
  imports: [HttpModule, ErrorModule],
  providers: [GithubService, GithubResolver],
})
export class GithubModule {}
