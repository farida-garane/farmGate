const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { full_name, phone, password, role } = req.body;

    if (!full_name || !phone || !password || !role) {
      const error = new Error('full_name, phone, password et role sont requis');
      error.statusCode = 400;
      throw error;
    }

    const newUser = await authService.register({ full_name, phone, password, role });
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