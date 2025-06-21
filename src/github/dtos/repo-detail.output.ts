import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RepoDetails {
  @Field() name: string;
  @Field() size: number;
  @Field() owner: string;
  @Field() isPrivate: boolean;
  @Field() numberOfFiles: number;
  @Field({ nullable: true }) ymlFileContent?: string;
  @Field(() => [String]) webhooks: string[];
}
