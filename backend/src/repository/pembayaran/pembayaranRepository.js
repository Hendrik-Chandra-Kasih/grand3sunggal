import { prisma } from '../../config/prisma.js';

export class PembayaranRepository {
  async findAll() {
    return await prisma.pembayaran.findMany({
      orderBy: { id_pembayaran: 'desc' },
    });
  }

  async findById(id) {
    return await prisma.pembayaran.findUnique({
      where: { id_pembayaran: id },
    });
  }

  async create(data) {
    return await prisma.pembayaran.create({
      data,
    });
  }

  async update(id, data) {
    return await prisma.pembayaran.update({
      where: { id_pembayaran: id },
      data,
    });
  }

  async delete(id) {
    return await prisma.pembayaran.delete({
      where: { id_pembayaran: id },
    });
  }
}
