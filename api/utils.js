const express = require("express");

//requireUser func
const requireUser = (req, res, next) => {
    if(!req.user){
        next({
            name: "MissingUserError",
            message: "you must be logged in to perform this action",
        });
    }

    next();
}

//requireAdmin func

const requireAdmin = (req, res, next) => {
    if(!req.user.isAdmin){
        next({
            name: "AdminError",
            message: "you must be an admin user to perform this action",
        });
    }

    next();
}

//requireJo func
const requireJo = (req, res, next) => {
    if(!req.user.id === 1){
        next({
            name: "Admin Error",
            message: "joann is the only user who can perform this action",
        });
    }
    
    next();
}

module.exports = {
    requireUser,
    requireAdmin
}