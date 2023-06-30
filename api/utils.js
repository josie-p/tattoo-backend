//requireAdmin func
const express = require("express");

const requireAdmin = (req, res, next) => {
    if(!req.user.isAdmin){
        next({
            name: "AdminError",
            message: "you must be an admin user to perform this action",
        });
    }

    next();
}

module.exports = {
    requireAdmin
}