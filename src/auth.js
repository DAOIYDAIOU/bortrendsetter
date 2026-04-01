import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';
import { config } from './config.js';

export async function ensureAdminUser() {
  const login = config.ADMIN_LOGIN;
  const password = config.ADMIN_PASSWORD;

  if (!login) throw new Error('Missing required env: ADMIN_LOGIN');
  if (!password) throw new Error('Missing required env: ADMIN_PASSWORD');

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { login },
    update: { passwordHash },
    create: { login, passwordHash },
  });
}

export function signAdminToken(payload) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });
}

export function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
