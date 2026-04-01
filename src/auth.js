import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';
import { config } from './config.js';

export async function ensureAdminUser() {
  const login = config.adminLogin;
  const password = config.adminPassword;

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { login },
    update: { passwordHash },
    create: { login, passwordHash },
  });
}

export function signAdminToken(admin) {
  return jwt.sign(
    { id: admin.id, login: admin.login },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
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

    const decoded = jwt.verify(token, config.jwtSecret);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
