# TomodachiShare Development Instructions

Welcome to the TomodachiShare development guide! This project uses [pnpm](https://pnpm.io/) for package management, [Next.js](https://nextjs.org/) with the app router for the front-end and back-end, [Prisma](https://prisma.io) for the database, [TailwindCSS](https://tailwindcss.com/) for styling, and [TypeScript](https://www.typescriptlang.org/) for type safety.

## Getting started

To get the project up and running locally, follow these steps:

```bash
$ git clone https://github.com/trafficlunar/tomodachi-share
$ cd tomodachi-share
$ pnpm install
```

Prisma types are generated automatically, however, sometimes you might need to:

```bash
# Generate Prisma client types
$ pnpm prisma generate

# Or, if you've added new database properties
$ pnpm prisma migrate dev
$ pnpm prisma generate
```

I recommend opting out of Next.js' telemetry program but it is not a requirement.

```bash
$ pnpm exec next telemetry disable
```

## Environment variables

You'll need a PostgreSQL database and Redis database. I would recommend using [Docker](https://www.docker.com/) to set these up quickly. Just create a `docker-compose.yaml` with the following content and run `docker compose up -d`:

```yaml
services:
  db:
    image: postgres
    restart: always
    shm_size: 1024mb
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: frieren

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080

  redis:
    image: redis
    restart: always
    ports:
      - 6379:6379
```

After starting the docker applications, apply TomodachiShare's database schema migrations.

```bash
$ pnpm prisma migrate dev
```

After, make a copy of the `.env.example` file and rename it to `.env`. The database variables should be pre-configured, but you'll need to fill in the rest of the variables.

For the `AUTH_SECRET`, run the following in the command line:

```bash
$ pnpx auth secret
```

> [!NOTE]
> This command may put the secret in a file named `.env.local`, if that happens copy it and paste it into `.env`

Now, let's get the Discord and GitHub authentication set up. If you don't plan on editing any code associated with authentication, you likely only need to setup one of these services.

For Discord, create an application in the developer portal, go to 'OAuth2', copy in the Client ID and Secret into the respective variables and also add this as a redirect URL: `http://localhost:3000/api/auth/callback/discord`.

For GitHub, navigate to your profile settings, then 'Developer Settings', and create a new application. Set the homepage URL to `http://localhost:3000` and copy the Client ID and generate a new client secret. Finally, add in a callback URL with the value `http://localhost:3000/api/auth/callback/github`.

After configuring the environment variables, you can run a development server.

```bash
$ pnpm dev
```

## Building

It's a good idea to build the project locally before submitting a pull request. This helps catch any potential errors and see how things will look in a production environment.

```bash
# Build the project
$ pnpm build

# Run the built version
$ pnpm start
```
