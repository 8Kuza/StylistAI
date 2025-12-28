# StylistAI

This is a [Next.js](https://nextjs.org) project designed to act as your personal AI fashion stylist.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker & Docker Compose](https://www.docker.com/) (for the database)

## Getting Started

Follow these steps to get the project running locally:

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/8Kuza/StylistAI.git
cd StylistAI
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and fill in your keys:

```bash
cp .env.example .env
```

You will need to add your `OPENAI_API_KEY` for the AI features. The database configuration is already set up to work with the Docker container provided.

### 3. Start the Database

Start the PostgreSQL database (with pgvector support) using Docker Compose:

```bash
docker-compose up -d
```

### 4. Run Migrations

Initialize the database schema:

```bash
npx prisma migrate dev
```

### 5. Start the Application

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
