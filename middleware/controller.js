const jwt=require('jsonwebtoken');
const config=require('../config');
const user_data=require('../Models/user_schema');



const generateAuthToken = async function (id, data) {
    try {
        const tokenGen = await jwt.sign({ id: id }, config.Secret_key);
        data.token = tokenGen;
        data.save();
        return tokenGen;
    } catch (err) {
        console.log(err);
    }
}

const ensureAuth = async function (req, res, next) {
    try {
        if (!req.cookies.jwt_token) {
            res.send({
                status: "Failed",
                message: 'Some Error Occured , Login again'
            })
        }
        else {
            const token = req.cookies.jwt_token;
            const verifyuser = jwt.verify(token, config.Secret_key);
            // console.log(verifyuser, "###################################");

            const userdata = await user_data.findOne({ _id: verifyuser.id });
            // console.log(userdata, "#############################");

            req.userdata=userdata;
            req.token=token;

            next();
        }
    } catch (error) {

        res.status(401).send(error);

    }

}

module.exports={
    generateAuthToken,
    ensureAuth
}