const express = require("express");
const jwt = require("jsonwebtoken");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { createUser,
    getUserByUsername,
    getUser,


} = require("../db");

//POST IS BUGGING, BUT I'M STILL HITTING SOMETHING! COME BACK LATER

//POST /api/users/register
usersRouter.post("/register", async(req, res, next) => {
    const { username, password } = req.body;

    console.log("username and password from createuser post", username, password, req.body);

    //if there's no username or password, send error
    if(!username || !password){
        res.status(401);
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and a password",
        });
    }

    // console.log(await getUserByUsername(username));

    const _user = await getUserByUsername(username);
    console.log("user from test on 32", _user);
    
    try {


        //send info into getUser func
        // const _user = await getUserByUsername(username)

        // console.log(_user, "user");

        // console.log("do i get here!")

        //if a user is returned, then the user already exists; throw error
        if(_user){
            res.status(401);
            next({
                name: "User duplication error",
                message: "User already exists",
            });
        }else if(password.length < 8){
            next({
                name: "password length error",
                message: "password too short",
            });
        }else{
            const user = await createUser({ username: username, password: password, isAdmin: true });

            if(!user){
                next({
                    name: "user does not exist",
                    message: "user does not exist",
                });
            }else{
                const token  = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET, {
                    expiresIn: "1w",
                });

                delete user.password;

                res.send({
                    message: "you have been registered as an admin user!",
                    token,
                    user,
                    success: true,
                });
            }

        }

    } catch ({ name, message }) {
        res.status(400);
        next({
            name: "registration error",
            message: "something went wrong during registration!"
        });
    }

});



module.exports = usersRouter;
