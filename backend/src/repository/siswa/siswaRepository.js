import { prisma } from '../../config/prisma.js';

export class SiswaRepository {
  async findAll() {
    return await prisma.siswa.findMany({
      orderBy: { id_siswa: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.siswa.findUnique({
      where: { id_siswa: id },
    });
  }

  async create(data) {
    return await prisma.siswa.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.siswa.update({
      where: { id_siswa: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.siswa.delete({
      where: { id_siswa: id },
    });
  }
}
