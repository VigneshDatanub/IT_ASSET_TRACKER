import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import * as userModel from '../models/userModel.js';
import config from '../config/env.js';

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.getUserByUsername(username);

  if (!user || !(await userModel.verifyPassword(password, user.password_hash, username))) {
    const error = new Error('Invalid username or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: '8h' }
  );

  res.json({ success: true, data: { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } } });
});

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const [existingUsername, existingEmail] = await Promise.all([
    userModel.getUserByUsername(username),
    userModel.getUserByEmail(email)
  ]);

  if (existingUsername) {
    const error = new Error('Username already exists');
    error.statusCode = 409;
    throw error;
  }

  if (existingEmail) {
    const error = new Error('Email address is already registered');
    error.statusCode = 409;
    throw error;
  }

  // Public registration must never grant a privileged role.
  const createdUser = await userModel.createUser({ username, email, password, role: 'user' });

  res.status(201).json({ success: true, data: createdUser });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.getAllUsers();
  res.json({ success: true, data: users });
});
