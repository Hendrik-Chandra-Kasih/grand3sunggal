import { prisma } from '../../config/prisma.js';

export class KelasSiswaRepository {
  async findAll() {
    return await prisma.kelasSiswa.findMany({
      orderBy: { id_kelas_siswa: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.kelasSiswa.findUnique({
      where: { id_kelas_siswa: id },
    });
  }

  async create(data) {
    return await prisma.kelasSiswa.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.kelasSiswa.update({
      where: { id_kelas_siswa: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.kelasSiswa.delete({
      where: { id_kelas_siswa: id },
    });
  }
}
