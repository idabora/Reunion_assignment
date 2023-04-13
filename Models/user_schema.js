const mongoose=require('mongoose');

const userSchema= new mongoose.Schema(
    {
        username:{

            type: String,
            required:[true,"Username is required"],
            unique:true,
            trim:true
        },
        email:{

            type: String,
            required:[true,"Email is required"],
            unique:true,
            trim:true
        },
        password:{
            type:String,

        },
        followers:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user_data",
    
        }],
        followings:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user_data",
        }],
        token:{
            type:String,
            default:""
        }
    }
)

const user_data=new mongoose.model('user_data',userSchema);
module.exports=user_data;

