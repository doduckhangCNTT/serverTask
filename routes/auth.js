const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

const User = require('../models/User');

// router.get('/', (req, res) => res.send('USER ROUTED'));

// Kiểm tra người dùng đã login hay chưa
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(404)
      .json({ success: false, message: 'Missing username / password' });
  }

  try {
    // Kiểm tra trong database xem tên người dùng đã tồn tại hay chưa
    const user = await User.findOne({ username });
    if (user) {
      return res
        .status(404)
        .json({ success: false, message: 'Da ton tai ten nguoi dung' });
    }

    // Mã hóa password
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({ username, password: hashedPassword });
    // Lưu thông tin người dùng vào database
    await newUser.save();

    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({
      success: true,
      message: 'User created successfully',
      accessToken,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);
  if (!username || !password) {
    return res
      .status(404)
      .json({ success: false, message: 'Missing username / password' });
  }
  // Mỗi khi nói chuyện với database thì sd try catch
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Khong ton tai / Khong khop username',
      });
    }
    // Kiểm tra passwords người dùng gõ vào có đúng hay ko
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: 'Khong khop password',
      });
    }
    // tạo ra token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.json({
      success: true,
      message: 'User Loggin successfully',
      accessToken,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
