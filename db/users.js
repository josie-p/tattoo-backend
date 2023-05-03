const client = require("./client");
const bcrypt = require("bcrypt");

//create a user!
const createUser = async({ username, password, isAdmin }) => {
    try {
        const SALT_COUNT = 10;
        const hashed_password = await bcrypt.hash(password, SALT_COUNT);

        const { rows: [user] } = await client.query(`
        INSERT INTO users (username, password, "isAdmin")
        VALUES ($1, $2, $3)
        RETURNING id, username, "isAdmin"; 
        `, [username, hashed_password, isAdmin]);

        console.log("finished creating user!!");
        console.log(user, "user from createUser!");
        return user;

    } catch (error) {
        console.error("error creating user!");
        throw error;
    }
}

//get a user by their username
const getUserByUsername = async(username) => {
    try {

        //query to get user by username
        const { rows: [user], } = await client.query(`
       SELECT *
       FROM users
       WHERE username = $1; 
        `, [username]);

        return user;

    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getUser = async({ username, password }) => {
    try{
        //get user by username:
        const user = await getUserByUsername(username);

        //get hashed password:
        const hashed_password = user.password;

        //compare passwords:
        const passwordsMatch = await bcrypt.compare(password, hashed_password);

        //if passwords match, return user; else, do not:
        if(passwordsMatch){
            user.password = "";
            console.log(user, "user from getUser");
            return user;
        }else{
            return;
        }
    }catch(error){
        console.error(error);
        throw error;
    }
}



module.exports = {
    createUser: createUser,
    getUser: getUser,
}