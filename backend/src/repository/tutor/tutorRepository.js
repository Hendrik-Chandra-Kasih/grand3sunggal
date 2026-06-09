import { prisma } from '../../config/prisma.js';

export class TutorRepository {
  async findAll() {
    return await prisma.tutor.findMany({
      orderBy: { id_tutor: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.tutor.findUnique({
      where: { id_tutor: id },
    });
  }

  async create(data) {
    return await prisma.tutor.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.tutor.update({
      where: { id_tutor: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.tutor.delete({
      where: { id_tutor: id },
    });
  }
}
