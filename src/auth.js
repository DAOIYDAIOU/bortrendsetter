import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './config.js';
import { prisma } from './prisma.js';

export function signAdminToken(admin) {
  return jwt.sign({ sub: admin.id, login: admin.login, role: 'admin' }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

export function adminAuthMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    req.admin = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: 'Токен недействителен' });
  }
}

export async function ensureAdminUser() {
  const login = config.adminLogin;
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { login },
    update: { passwordHash },
    create: { login, passwordHash },
  });
}
