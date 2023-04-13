const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            time: true
        },
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_data'
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user_data'
        }],
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'comment_data'
        }],
    }
)

const post_data=new mongoose.model('post_data',postSchema);
module.exports=post_data;

