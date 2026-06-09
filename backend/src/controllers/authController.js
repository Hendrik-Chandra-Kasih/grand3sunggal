import bcrypt from 'bcryptjs';
import { UserRepository } from '../repository/user/userRepository.js';

const userRepository = new UserRepository();

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, and role are required' });
    }

    const existing = await userRepository.findByUsername(username);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userRepository.create({
      username,
      password: hashedPassword,
      role,
    });

    const token = await userRepository.authenticate(username, password, false);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user.id_user, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const token = await userRepository.authenticate(username, password, rememberMe);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = await userRepository.findByUsername(username);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id_user, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await userRepository.findById(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
