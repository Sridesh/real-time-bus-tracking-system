const userRepository = require('../repositories/user.repository');

const signup = async (req, res) => {
  try {
    const { phone_number, password, role, email, name } = req.body;

    const user = await userRepository.createUser({
      phone_number,
      passwordHash: password,
      role,
      email,
      name,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(error.code || 500).send(error.message || 'User creation failed');
  }
};

const login = async (req, res) => {};

const logout = async (req, res) => {};

module.exports = { signup, login, logout };
