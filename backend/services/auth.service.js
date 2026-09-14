const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function register({ full_name, phone, password, role = 'FARMER', region = null }) {
  const existing = await prisma.user.findUnique({ where: { phone } });

  if (existing) {
    const error = new Error('Ce numéro de téléphone est déjà utilisé');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedRole = role.toUpperCase();

  const user = await prisma.user.create({
    data: {
      fullName: full_name,
      phone,
      passwordHash,
      role: normalizedRole,
      region
    }
  });

  return {
    id: user.id,
    fullName: user.fullName,
    full_name: user.fullName,
    phone: user.phone,
    role: user.role,
    region: user.region,
  };
}

async function login({ phone, password }) {
  const user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    const error = new Error('Identifiants invalides');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error('Identifiants invalides');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      full_name: user.fullName,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
}

module.exports = {
  register,
  login,
};