const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = {
  title: {
    type: String,
    required: true
  },
  description: {
    type: String, 
  },
  status: {
    type: String,
    enum: ['TO LEARN', 'LEARNING', 'LEARNED']
  },
  user: {
    type: Schema.Types.ObjectId,
    // ket noi sang cai bang 
    ref: 'users' 
  }
}
module.exports = mongoose.model('posts', PostSchema)

