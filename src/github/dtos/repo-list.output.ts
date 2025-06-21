import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RepoListItem {
  @Field() name: string;
  @Field() size: number;
  @Field() owner: string;
}
