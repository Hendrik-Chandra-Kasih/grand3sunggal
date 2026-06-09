import 'dotenv/config'; // Memuat variabel lingkungan dari .env

const config = {
  schema: 'prisma/schema.prisma',
  seed: 'ts-node prisma/seed.ts', // Hanya mendefinisikan jalur seed
  datasource: {
    url: process.env.DATABASE_URL,
  },
};

export default config;