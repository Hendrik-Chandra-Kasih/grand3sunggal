import { prisma } from '../../config/prisma.js';

export class AbsensiSiswaRepository {
  async findAll() {
    return await prisma.absensiSiswa.findMany({
      orderBy: { id_absensi: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.absensiSiswa.findUnique({
      where: { id_absensi: id },
    });
  }

  async create(data) {
    return await prisma.absensiSiswa.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.absensiSiswa.update({
      where: { id_absensi: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.absensiSiswa.delete({
      where: { id_absensi: id },
    });
  }
}
