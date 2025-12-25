import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../models';
import { AuthRequest } from '../middleware';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await AdminUser.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }

    const existingUser = await AdminUser.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const user = new AdminUser({
      email,
      password,
      name,
      role: role || 'editor',
      permissions: role === 'admin' 
        ? ['templates:read', 'templates:write', 'templates:delete', 'media:read', 'media:write', 'media:delete', 'users:read', 'users:write']
        : ['templates:read', 'templates:write', 'media:read', 'media:write']
    });

    await user.save();

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions
      }
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await AdminUser.findById(req.user?.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
