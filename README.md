# 🧠 Playground

> Playground lets you connect with fellow aspirants and prepare for your exams through a real-time question-solving game. Track your progress, compete live, and stay motivated with a community of learners.

---

## 🚀 Getting Started

Follow these steps to run the project locally.

---

### 🛠️ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/)
- [PNPM](https://pnpm.io/) or [NPM](https://docs.npmjs.com/)
- [TurboRepo](https://turbo.build/repo) (already included in `devDependencies`)

---

## 🛠️ Environment Setup

### ⚙️ Environment Variables

Create a `.env` file inside the `packages/db` directory with the following content:

```env
# Replace the following with your actual PostgreSQL connection string

DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>?sslmode=require"
 ```


🌐 Using NeonDB or Other Cloud PostgreSQL Providers
If you're using a cloud database like NeonDB:

Go to your Neon dashboard and copy the PostgreSQL connection URL.

Paste the URL into the DATABASE_URL inside your .env file (packages/db/.env).

Navigate to the packages/db directory and run the following command to apply the migrations:

```bash
cd packages/db
npx prisma migrate deploy
```


### 🐳 Using Docker

If you're running PostgreSQL with Docker (using the provided `docker-compose.yml` file), follow these steps after starting the container:

1. Start Docker:

```bash
cd packages/db
npx prisma migrate deploy
```

Make sure your .env file inside packages/db is configured like this:
```bash
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"