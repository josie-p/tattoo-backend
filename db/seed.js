const client = require("./client");

//import dummy data:
const { adminUsers, tattoos } = require("./index");

//drop tables: 
const dropTables = async() => {
    try{
        //connect to client
        client.connect();
        console.log("dropping all tables!");

        //drop tables:
        await client.query(`
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS products; 
        `);

        console.log("finished dropping tables!");
    }catch(error){
        console.error("error dropping tables!");
        throw error;
    }
}

//create tables:
const createTables = async() => {
    try {
        
        //create users and products table:
        await client.query(`
       CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        "isAdmin" BOOLEAN DEFAULT false
       ) ;

       CREATE TABLE products(
        id SERIAL PRIMARY KEY,
        imgURL varchar(255) NOT NULL, 
        description varchar(350)
       );
        `);

        console.log("finished creating tables!");

    } catch (error) {
        console.error("error building tables!");
        throw error;
    }
}

//create initial users:
// const createInitialUsers = async() => {
//     console.log("starting to create users!");
//     try {
        //create initial users!
//         for(let i = 0; i < adminUsers.length; i++){
//             await createUser(adminUsers[i]);
//         }
//     } catch (error) {
//         console.error("error creating initial users!");
//         throw error;
//     }
// }

//rebuild db
async function rebuildDB() {
    try {
        await dropTables();
        await createTables();
        //initial functions:
        
    } catch (error) {
        console.log("error rebuilding db!");
        throw error;
    }
}

//run rebuild db:
rebuildDB()
    .catch(console.error)
    .finally(() => client.end());