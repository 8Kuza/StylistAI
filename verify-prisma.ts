import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

// Mock env if missing for test
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mydb'

try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    const client = new PrismaClient({ adapter });
    console.log('SUCCESS: PrismaClient imported and instantiated successfully.');
    process.exit(0);
} catch (e) {
    console.error('FAILURE: Could not instantiate PrismaClient', e);
    process.exit(1);
}
