const appError = require('../utils/appError');

module.exports = (...roles) => {
    console.log('roles', roles);

    return (req, resp, next) => {
        if(!roles.includes(req.currentUser.role)){
            const error = appError.create('This role is not authorized [ ADMIN - MANAGER ]' , 401);
            return next(error);
        }
        next();
    }
}