const express = require("express");
const jwt = require("jsonwebtoken");
const usersRouter = express.Router();
const bcrypt = require("bcrypt");
const { requireUser, requireAdmin, requireJo } = require("./utils");
const { createUser,
    getUserByUsername,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,


} = require("../db");


//POST /api/users/register-- route is working!
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

    
    try {

        //send info into getUserByUsername func
        const _user = await getUserByUsername(username);


        //if a user is returned, then the user already exists; throw error, also if password is too short
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

            //create user
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
        //if try fails, set status and send error
        res.status(400);
        next({
            name: "registration error",
            message: "something went wrong during registration!"
        });
    }

});

//POST /api/users/login-- route is working!!
usersRouter.post("/login", async (req, res, next) => {

    const { username, password } = req.body;

    //if there's no username or password, send error
    if(!username || !password){
        res.status(401);

        next({ 
            name: "MissingCredentialsError",
            message: "Please supply both a username and a password."
         })

    }

    try {
        //does the user exist?
        const user = await getUserByUsername(username);

        //is the password correct?
        const isValid = await bcrypt.compare(password, user.password);

        //if the user exists and the password is correct, get token for user and send data back; else, send error
        if(user && isValid){
            const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET);

            delete user.password;

            res.send({ message: "you're logged in!", token, user, success: true });
        }else{
            res.status(401);
            next({ 
                name: "IncorrectCredentialsError",
                message: "email or password is incorrect",
             });
        }       
    } catch ({ name, message }) {
        //if try errors, set status and send error message
        res.status(400);
        next({ 
            name: "login error",
            message: "something went wrong during login!",
         });
    }
})

//GET /api/users/all-- working!!
usersRouter.get("/all", async(req, res, next) => {
    try{

        const allUsers = await getAllUsers();
        res.send({ allUsers: allUsers, success: true });

    }catch({ name, message }){
        next({
            name: "error getting all users",
            message: "something happened while getting all users",
        });
    }
})

//-- add a patch for personal profiles, not necessarily for editing other people's accounts

//PATCH /api/users/edit-user
//ref //PATCH user admin:
// usersRouter.patch(
//     "/admin/edit-user/:userId" LINE 368
usersRouter.patch("/edit-my-info", requireUser, async(req, res, next) => {
    const userId = req.user.id;
    console.log(req.body);
    const { username, password } = req.body;
    console.log(username, password, "username and password from body!");

    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);
    const fields = {};

    if(username){
        fields.username = username;
    }
    if(password){
        fields.password = hashedPassword;
    }

    console.log(fields, "fields after edit!");

    try{
        const user = await updateUser(userId, fields);

        if(user){
            res.send({
                user: user,
                success: true
            });
        }

    }catch({ name, message }){
        next({
            name: "ErrorUpdatingUser",
            message: "error updating user info",
        });
    }

})

//delete my account route -- successful!
usersRouter.delete("/delete-me", requireUser, async(req, res, next) => {
    const userId = req.user.id;
    console.log(req.user, "req user");

    try {
        const deletedUser = await deleteUser(userId);
        if(userId === deletedUser.id){
            res.send({
                deletedUser: deletedUser,
                success: true
            })
        }else{
            throw error;
        }
        
    } catch ({ name, message }) {
        next({
            name: "ErrorDeletingAccount",
            message: "there was an error deleting your account",
        });
    }
})

//delete other user's account
usersRouter.delete("/delete-user/:userId", requireJo, async(req, res, next) => {
    const userId = req.params.userId;
    console.log(req.user, "req.user");
    try {
        const deletedUser = await deleteUser(userId);
        res.send({
            deletedUser: deletedUser,
            success: true,
        });
    } catch ({ name, message }) {
       next({
        name: "ErrorDeletingUser",
        message: "there was an error deleting the user",
       });
    }
})



module.exports = usersRouter;
