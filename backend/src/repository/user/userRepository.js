import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET;

export class UserRepository {
  async findByUsername(username) {
    return await prisma.user.findUnique({
      where: { username },
    });
  }

  async create(data) {
    return await prisma.user.create({
      data: {
        username: data.username,
        password: data.password,
        role: data.role,
      },
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id_user: id },
      select: {
        id_user: true,
        username: true,
        role: true,
      },
    });
  }

  async authenticate(username, password, rememberMe) {
    const user = await this.findByUsername(username);

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const expiresIn = rememberMe ? '90d' : '1h';
    const token = jwt.sign({ id: user.id_user }, JWT_SECRET, { expiresIn });
    return token;
  }
}
