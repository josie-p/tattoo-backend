const client = require("./client");
const bcrypt = require("bcrypt");

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

module.exports = {
    createUser: createUser,

}