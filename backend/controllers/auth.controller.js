const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    let { full_name, phone, password, role, region } = req.body;

    if (!full_name || !phone || !password) {
      const error = new Error('full_name, phone et password sont requis');
      error.statusCode = 400;
      throw error;
    }

    const normalizedRole = (role || 'FARMER').toUpperCase();
    if (['ADMIN', 'AGENT'].includes(normalizedRole)) {
      const error = new Error('Inscription publique limitée ');
      error.statusCode = 403;
      throw error;
    }
    role = ['FARMER', 'BUYER'].includes(normalizedRole) ? normalizedRole : 'FARMER';

    const newUser = await authService.register({ full_name, phone, password, role, region });
    res.status(201).json({ status: 'success', data: newUser });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      const error = new Error('phone et password sont requis');
      error.statusCode = 400;
      throw error;
    }

    const result = await authService.login({ phone, password });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
};