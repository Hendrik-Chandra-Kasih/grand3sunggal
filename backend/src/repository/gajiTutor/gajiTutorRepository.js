import { prisma } from '../../config/prisma.js';

export class GajiTutorRepository {
  async findAll() {
    return await prisma.gajiTutor.findMany({
      orderBy: { id_gaji: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.gajiTutor.findUnique({
      where: { id_gaji: id },
    });
  }

  async create(data) {
    return await prisma.gajiTutor.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.gajiTutor.update({
      where: { id_gaji: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.gajiTutor.delete({
      where: { id_gaji: id },
    });
  }
}
