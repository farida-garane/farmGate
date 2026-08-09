const pool = require('../config/db');
const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function register({ full_name, phone, password, role }) {
  const existing = await pool.query(
    `select id from ${userModel.table} where phone = $1`,
    [phone]
  );

  if (existing.rows.length > 0) {
    const error = new Error('Ce numéro de téléphone est déjà utilisé');
    error.statusCode = 409;
    throw error;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `insert into ${userModel.table} (full_name, phone, password_hash, role)
     values ($1, $2, $3, $4)
     returning id, full_name, phone, role, created_at`,
    [full_name, phone, password_hash, role]
  );

  return result.rows[0];
}

async function login({ phone, password }) {
  const result = await pool.query(
    `select * from ${userModel.table} where phone = $1`,
    [phone]
  );

  const user = result.rows[0];

  if (!user) {
    const error = new Error('Identifiants invalides');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

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
    user: { id: user.id, full_name: user.full_name, phone: user.phone, role: user.role },
    token,
  };
}

module.exports = {
  register,
  login,
};