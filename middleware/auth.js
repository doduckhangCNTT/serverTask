const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Access token not found' });
  }

  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decode);
    // gửi kèm theo cho req thêm cái userId đã qua kiểm duyệth
    req.userId = decode.userId;
    next();
  } catch (err) {
    console.log(err);
    return res
      .sendStatus(403)
      .json({ success: false, message: 'Invalid token' });
  }
};

module.exports = verifyToken;
