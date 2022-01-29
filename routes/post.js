const express = require('express');
const verifyToken = require('../middleware/auth');
const router = express.Router();

const Post = require('../models/Post');

// Lấy ra toàn bộ posts của người dùng tương ứng

router.get('/', verifyToken, async (req, res) => {
  try {
    // Tìm ra người dùng tương ứng với userId
    const posts = await Post.find({ user: req.userId }).populate(
      'user',
      'username'
    );
    res.json({ success: true, posts });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;

  // Do chỉ bắt buộc phải có title lên cần phải kiểm tra xem title có tồn tại hay ko
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: 'Title is required' });
  }

  try {
    const newPost = new Post({
      title,
      description,
      url: url.startsWith('https://') ? url : `https://${url}`,
      status: status || 'TO LEARN',
      user: req.userId,
    });
    // Lưu thông tin Post ms vào database
    await newPost.save();
    res.json({ success: true, message: 'Happy learning', post: newPost });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// update post

router.put('/:id', verifyToken, async (req, res) => {
  const { title, description, url, status } = req.body;
  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: 'Title is required' });
  }

  try {
    let updatedPost = {
      title,
      description: description || '',
      url: (url.startsWith('https://') ? url : `https://${url}`) || '',
      status: status || 'TO LEARN',
      // user: req.userId
    };
    console.log('OK');
    // Điều kiện để người dùng có thể update được post
    const postUpdateCondition = { _id: req.params.id, user: req.userId };
    updatedPost = await Post.findOneAndUpdate(
      postUpdateCondition,
      updatedPost,
      {
        new: true,
      }
    );

    if (!updatedPost) {
      return res.status(401).json({
        success: false,
        message: 'Past not found or user not authorized',
      });
    }
    // Update thanh cong
    res.json({
      success: true,
      message: 'Internal server error',
      post: updatedPost,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Xoa post theo id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Dieu kien de co the xoa post
    const postDeleteCondition = { _id: req.params.id, user: req.userId };
    const deletePost = await Post.findOneAndDelete(postDeleteCondition);
    if (!deletePost) {
      return res.status(401).json({
        success: false,
        post: deletePost,
      });
    }
    res.json({ success: true, post: deletePost });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
