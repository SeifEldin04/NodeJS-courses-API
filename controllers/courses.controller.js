const Course = require('../models/courses.model');
const asyncwrapper = require('../middleware/asyncwrapper');
const httpStatusText = require('../utils/httpStatusText');
const appError = require('../utils/appError');

const getAllCourses = async (req, resp, next) => {
    const query = req.query;

    const limit = query.limit || 4;
    const page = query.page || 1;
    const skip = (page - 1) * limit;

    const courses = await Course.find({}, { '__v': false }).limit(limit).skip(skip)
    resp.status(200).json({ status: httpStatusText.SUCCESS, data: { courses } })
}

const addCourse = asyncwrapper(async (req, resp, next) => {
    const newCourse = new Course(req.body);
    await newCourse.save()

    resp.status(201).json({ status: httpStatusText.SUCCESS, data: { course: newCourse } })
})

const getSpecificCourse = asyncwrapper(async (req, resp, next) => {
    const courseId = req.params.courseId;

    const courseFinded = await Course.findById(courseId)

    if (!courseFinded) {
        const error = appError.create('This course is not found', 404, httpStatusText.FAIL);
        return next(error)
    }

    resp.status(200).json({ status: httpStatusText.SUCCESS, data: { course: courseFinded } })
})

const updateCourse = asyncwrapper(async (req, resp, next) => {
    const courseId = req.params.courseId;

    const courseUpdated = await Course.updateOne({ _id: courseId }, { $set: { ...req.body } })

    if (!courseUpdated) {
        const error = appError.create('Invalid course ID', 400, httpStatusText.FAIL);
        return next(error)
    }

    resp.status(200).json({ status: httpStatusText.SUCCESS, data: { course: courseUpdated } })
})

const deleteCourse = asyncwrapper(async (req, resp, next) => {
    const courseId = req.params.courseId;
    await Course.deleteOne({ _id: courseId })

    resp.status(200).json({ status: httpStatusText.SUCCESS, data: null })
})

module.exports = {
    getAllCourses,
    getSpecificCourse,
    updateCourse,
    addCourse,
    deleteCourse
}