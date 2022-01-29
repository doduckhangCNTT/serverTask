// Tạo backend
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const postRouter = require('./routes/post');
const authRouter = require('./routes/auth');
const cors = require('cors');

// Kết nối database
const connectDb = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@task.5rt0u.mongodb.net/task?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Mongoodb connected');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
connectDb();

const app = express();

// đọc dữ liệu json bên phía request
app.use(express.json());
// Được sử dụng để có thể giao tiếp giữa frontend và backend
app.use(cors());
// Gọi và nói url với đường dẫn tương ứng
app.use('/api/auth', authRouter);

app.use('/api/posts', postRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at ${PORT}`));
