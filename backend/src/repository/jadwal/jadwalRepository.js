import { prisma } from '../../config/prisma.js';

export class JadwalRepository {
  async findAll() {
    return await prisma.jadwal.findMany({
      orderBy: { id_jadwal: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.jadwal.findUnique({
      where: { id_jadwal: id },
    });
  }

  async create(data) {
    return await prisma.jadwal.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.jadwal.update({
      where: { id_jadwal: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.jadwal.delete({
      where: { id_jadwal: id },
    });
  }
}
