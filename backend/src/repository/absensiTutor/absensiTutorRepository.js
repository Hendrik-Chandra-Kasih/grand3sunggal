import { prisma } from '../../config/prisma.js';

export class AbsensiTutorRepository {
  async findAll() {
    return await prisma.absensiTutor.findMany({
      orderBy: { id_absensi_tutor: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.absensiTutor.findUnique({
      where: { id_absensi_tutor: id },
    });
  }

  async create(data) {
    return await prisma.absensiTutor.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.absensiTutor.update({
      where: { id_absensi_tutor: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.absensiTutor.delete({
      where: { id_absensi_tutor: id },
    });
  }
}
