const express = require('express');
const router = express.Router();

const coursesController = require('../controllers/courses.controller');
const verifyToken = require('../middleware/verifyToken');
const allowedTo = require('../middleware/allowedTo');
const userRoles = require('../utils/userRoles');

router.route('/')
    .get(coursesController.getAllCourses)
    .post(verifyToken, coursesController.addCourse)

router.route('/:courseId')
    .get(coursesController.getSpecificCourse)
    .patch(coursesController.updateCourse)
    .delete(verifyToken , allowedTo(userRoles.ADMIN , userRoles.MANAGER) ,coursesController.deleteCourse)

module.exports = router;