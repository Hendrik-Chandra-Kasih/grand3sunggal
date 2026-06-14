import { MapelRepository } from '../repository/mapel/mapelRepository.js';

const mapelRepository = new MapelRepository();

const handleError = (res, error) => {
  console.error('❌ MapelController error:', error);
  res.status(500).json({ success: false, message: error.message });
};

export const getAllMapel = async (req, res) => {
  try {
    const mapel = await mapelRepository.findAll();
    res.json({ success: true, data: mapel });
  } catch (error) {
    handleError(res, error);
  }
};

export const getMapelById = async (req, res) => {
  try {
    const mapel = await mapelRepository.findById(parseInt(req.params.id, 10));
    if (!mapel) {
      return res.status(404).json({ success: false, message: 'Mapel tidak ditemukan' });
    }

    res.json({ success: true, data: mapel });
  } catch (error) {
    handleError(res, error);
  }
};
