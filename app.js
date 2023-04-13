const express=require('express')
const app=express();
require('./connection/connection')
const user_data=require('./Models/user_schema');
const post_data=require('./Models/post_schema');
const comment_data=require('./Models/comment_schema');
const controller=require('./middleware/controller');
const bodyParser = require('body-parser');
const cookieParser=require('cookie-parser');



const hostname='127.0.0.1';
const PORT=process.env.port || 8000;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());


app.get('/',(req,res)=>{
    res.send("HELLO");
})

app.post('/api/authenticate',async (req,res)=>{

    // const Email='aman@gmail.com';
    // const Password='anurodh';
// console.log(req.body);
const Email=req.body.email;
    const Password=req.body.password;
 
    if(Email && Password)
    {
        var user=await user_data.findOne({email:Email})
       
       if(user!=null)
       {
 
          if(Password==user.password)
          {
             
            var id=user.id.toString();

            if(user.token=='')
            {
                user.token=await controller.generateAuthToken(user.id,user);
            }
            
            res.cookie( res.cookie('jwt_token',user.token,{
                httpOnly:true,
                maxAge: 600*1000,
             }))
            res.json(
                {
                    name:user.username,
                    token:user.token
                });
          }
          else{
              req.flash('message','Incorrect Password')
             return res.redirect('/login',{message:req.flash('message')});
          }
 
       }
       else{
          req.flash('message','User not found')
          return res.redirect('/login',{message:req.flash('message')});
 
          
        }
    }
    else{
       req.flash('message','Make sure each input field is filled');
       return res.redirect('/login',{message:req.flash('message')});
    }


})

// GET /api/user should authenticate the request and
//  return the respective user profile.
app.get('/api/user',controller.ensureAuth,(req,res)=>{
    try{

        const userdata=req.userdata;
        const fol=userdata.followings.length;
    const unfol=userdata.followers.length;
    res.json(
        {
            userName:userdata.username,
            Followers:fol,
            Following:unfol
        }
        )
    }catch(err){
        console.log(err);
        res.json(
            {
                message:"Error while getting user info"
            }
        )
    }

})

// POST /api/follow/{id} authenticated user would
//  follow user with {id}
app.post('/api/follow/:id',controller.ensureAuth,(req,res)=>{
    try{

        const id=req.params.id;
        // console.log(id);
    const userdata=req.userdata;
    userdata.followings.push(id);
    userdata.save();
    res.json({
        message:"Success"
    });
}catch(err){
    console.log(err);
    res.json(
        {
            message:"Error while following user"
        }
    )
}

})

// POST /api/unfollow/{id} authenticated user
//  would unfollow a user with {id}
app.post('/api/unfollow/:id',controller.ensureAuth,(req,res)=>{
    try{

        const id=req.params.id;
        // console.log(id);
    const userdata=req.userdata;
    userdata.followings.remove(id);
    userdata.save();
    res.json({
        message:"Sucess"
    })
}catch(err){
    console.log(err);
    res.json(
        {
            message:"Error while unfollowing user"
        }
    )
}
})


// POST api/posts/ would add a new post created by
//  the authenticated user.
app.post('/api/posts/',controller.ensureAuth,async (req,res)=>{
    try{

        const userdata=req.userdata;
        const id=userdata.id;
        // console.log(id);
    // req.createdBy=id;
    req.body.createdBy=id
    const post=await post_data.create(req.body);
    console.log(post);
    res.json(
        {
            postID:post.id,
            Titile:post.title,
            Description:post.description,
            CreatedTime:post.createdAt
        })
    }
    catch(err){
        res.json(
            {
                message:"Error while creating post"
            }
        )

    }
        
})


// DELETE api/posts/{id} would delete post with {id}
//  created by the authenticated user.
app.delete('/api/posts/:id',controller.ensureAuth,async (req,res)=>{
try{

    const postid=req.params.id;
    const post= await post_data.findOne({_id:postid})
    const userdata=req.userdata;
    const id=userdata.id;
    // console.log(id,post.createdBy)
    if(id==post.createdBy)
    {
        await post_data.findByIdAndRemove({_id:postid});
        res.json({
            message:"Deleted Sucessfully"
        })

    }
    else{
        res.json({
            message:"Something Wrong Happened"
        })
    }
}catch(err){
    console.log(err);
    res.json(
        {
            message:"Error while deleting post"
        }
    )
}
})

// POST /api/like/{id} would like the post with
//  {id} by the authenticated user.
app.post('/api/like/:id',controller.ensureAuth, async (req,res)=>{
    try{

        const pid=req.params.id;
        // console.log(pid);
    const post=await post_data.findOne({_id:pid});
    const id= req.userdata.id;
    post.likes.push(id);
    post.save();
    res.json({
        message:"Success"
    });
}catch(err){
    console.log(err);
    res.json(
        {
            message:"Error while liking post"
        }
    )
}

} )

// POST /api/unlike/{id} would unlike the post
//  with {id} by the authenticated user.
app.post('/api/unlike/:id',controller.ensureAuth, async (req,res)=>{
    try{

        const pid=req.params.id;
        // console.log(pid);
        const post=await post_data.findOne({_id:pid});
        const id= req.userdata.id;
        post.likes.remove(id);
        post.save();
        res.json({
            message:"Success"
        });
    }catch(err){
        console.log(err);
        res.json(
            {
                message:"Error while unliking post"
            }
        )
    }

})

// POST /api/comment/{id} add comment for
//  post with {id} by the authenticated user.
app.post('/api/comment/:id',controller.ensureAuth,async (req,res)=>{
    try{

        const pid =req.params.id;
        const post=await post_data.findOne({_id:pid});
    const comment=await comment_data.create(req.body);
    comment.commentID=req.userdata.id;
    comment.save();
    post.comments.push(comment.id);
    post.save();
    // console.log(req.body);
    res.json(
        {
            id:comment.id,
            commentID:comment.commentID
        }
        )
    }catch(err){
        console.log(err);
        res.json(
            {
                message:"Error while commenting post"
            }
        )
    }

})

// /GET api/posts/{id} would return a single post with 
// {id} populated with its number of likes and comments

app.get('/api/posts/:id',controller.ensureAuth,async (req,res)=>{
try{

    const id=req.params.id;
    // const post=await post_data.findOne({_id:id});
    await post_data.find({_id:id})
    .populate("comments")
    .populate("likes")
    .then((p)=>{
        // console.log(p[0]);
        res.send(p[0])
    }).catch((err)=>{
        console.log(err);
    })
}catch(err){
    console.log(err);
    res.json(
        {
            message:"Error while getting single post"
        }
    )
}

})

// GET /api/all_posts would return all posts created by
//  authenticated user sorted by post time.
app.get('/api/all_posts',controller.ensureAuth,async (req,res)=>{
try{

    const id=req.userdata.id;
    const arr=[];
    // console.log(id);
    const posts=await post_data.find({createdBy:id},{_id:1,title:1,description:1,createdAt:1,comments:1,likes:1})
    .sort({ createdAt: 'desc' })
    .populate("comments")
    .lean()
    .then((posts)=>{

        // console.log(posts.length);        
        var i=0;
        posts.forEach( async (post) => {
            if(i<posts.length)
            {
                post.likes=posts[i].likes.length;
                i++;
            }
        });
        i=0;
        posts.forEach(()=>{
            if(i<posts.length)
            {
                arr.push(posts[i])
                i++;
            }
        })
    })
    res.send(arr)
}catch(err){
    console.log(err);
    res.json(
        {
            message:"Error while getting authenticated user's posts"
        }
    )
}

})


app.listen(PORT,()=>{
    console.log(`Server listening on port http://${hostname}:${PORT}`);
})
