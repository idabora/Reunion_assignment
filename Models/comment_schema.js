const mongoose=require('mongoose');

const commentSchema=new mongoose.Schema(
    {
        comment:{
            type:String,
            trim:true
        },
        commentID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user_data'
        }

    }
)

const comment_data=new mongoose.model('comment_data',commentSchema);
module.exports=comment_data;