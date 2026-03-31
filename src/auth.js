import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';
import { config } from './config.js';

export async function ensureAdminUser() {
  const login = config.ADMIN_LOGIN;
  const password = config.ADMIN_PASSWORD;

  if (!login) {
    throw new Error('Missing required env: ADMIN_LOGIN');
  }

  if (!password) {
    throw new Error('Missing required env: ADMIN_PASSWORD');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { login },
    update: {
      passwordHash,
    },
    create: {
      login,
      passwordHash,
    },
  });
}
