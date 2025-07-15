# GitHub Scanner GraphQL API
Apollo GraphQL server built with TypeScript, integrating GitHub API to list repositories and fetch details.

### Frontend Application
* The frontend application is available [here](https://github.com/MRamanenkau/github-viewer).

## Getting Started
### Prerequisites
* `node.js`: v23 or higher.
* `npm`: v10 or higher.
* Note: Lower versions of `node.js` and `npm` may work, but there is no guarantee of compatibility.

### Setup Development Environment
1. Clone the Repository:
   ```
   git clone git@github.com:MRamanenkau/github-scanner.git
   cd github-scanner
   ```
2. Install Nest.js CLI globally:
   ```
   npm install -g @nestjs/cli
   ```
3. Install Dependencies:
   ```
   npm install
   ```
4. Configure Environment Variables:
   ```
   cp .env.example .env
   ```
5. Generate a GitHub Personal Access Token by following the [instructions](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic).
6. Add your GitHub Token to the `.env` file as follows: `GITHUB_TOKEN=your_token_here`.
7. Start the Development Server:
   ```
   npm run start:dev
   ```
    * The API will be available at http://localhost:3000.

## Available Queries
1. Get all repositories:
   ```graphql
   query ListRepos {
     listRepositories {
       name
       size
       owner
     }
   }
   ```
2. Get repository details:
   ```graphql
   query GetRepositoryDetails($repo: String!) {
      repositoryDetails(repo: $repo) {
         name
         size
         owner
         isPrivate
         numberOfFiles
         ymlFileContent
         webhooks
      }
   }
   ```
