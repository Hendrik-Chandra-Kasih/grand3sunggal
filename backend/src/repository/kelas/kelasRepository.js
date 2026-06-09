import { prisma } from '../../config/prisma.js';

export class KelasRepository {
  async findAll() {
    return await prisma.kelas.findMany({
      orderBy: { id_kelas: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.kelas.findUnique({
      where: { id_kelas: id },
    });
  }

  async create(data) {
    return await prisma.kelas.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.kelas.update({
      where: { id_kelas: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.kelas.delete({
      where: { id_kelas: id },
    });
  }
}
