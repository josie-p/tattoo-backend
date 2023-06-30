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

//get all users:
const getAllUsers = async() => {
    try {
        const { rows } = await client.query(`
        SELECT *
        FROM users; 
        `);

        console.log(rows, "all users from get all users!");
        return rows;
    } catch (error) {
        console.error(error);
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
      
        const userByUsername = await getUserByUsername(username);

        const hashedPassword = userByUsername.password;

        const passwordsMatch = await bcrypt.compare(password, hashedPassword);

        try {
            
            const { rows: [user] } = await client.query(`
            SELECT *
            FROM users
            WHERE id = ${userByUsername.id};    
            `);

            if(passwordsMatch){
                console.log("Invalid username and/or password");
                return null;
            }else{
                delete user.password;
                console.log("finished getting user!", user);

                return user;
            }

        } catch (error) {
            console.error(error);
            throw error;
        }

    }catch(error){
        console.error(error);
        throw error;
    }
}

//get user by id
const getUserById = async(userId) => {
    try {

        //query to get user by id
        const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE id = $1; 
        `, [userId]);

        console.log(user, "user from get user by id");
        
        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//edit user info- not sure if this one is necessary, but I figure it's probably best practice to change passwords semi-frequently:
const updateUser = async(userId, fields = {}) => {

        console.log("starting to update user with id", userId);

        //create string of info to insert with update
        const setString = Object.keys(fields)
        .map((key, index) => `"${key}"=$${index + 1}`)
        .join(", ");

        //if the string length is 0, break from the function and return nothing
        if(setString.length === 0){
            return;
        }

        try {
            //query to update user
            const { rows: [user] } = await client.query(`
          UPDATE users
          SET ${setString}
          WHERE id = ${userId}
          RETURNING *;  
            `, Object.values(fields));
        
            //don't return user's password;
        delete user.password;

        console.log("finished updating user!", user);
        return user;
        } catch (error) {
            console.error(error);
            throw error;
        }

   
}

//delete user- hard delete, because there aren't really any things dependent
const deleteUser = async(userId) => {
    try {
        console.log("starting to delete user with id", userId);

        //query to hard delete user:
        const { rows: [user] } = await client.query(`
        DELETE FROM users
        WHERE id = $1
        RETURNING *;
        `, [userId]);

        //don't return password
        delete user.password;

        console.log("finished deleting user!", user);

        return user;
    } catch (error) {
        console.error(error);
        throw error;
    }
}




module.exports = {
    createUser: createUser,
    getUserByUsername: getUserByUsername,
    getUser: getUser,
    getAllUsers: getAllUsers,
    getUser: getUser,
    getUserById: getUserById,
    updateUser: updateUser,
    deleteUser: deleteUser,
}