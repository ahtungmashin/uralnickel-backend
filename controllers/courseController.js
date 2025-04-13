import { Course } from '../models';

exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    next(err); // передаём ошибку в errorHandler
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      const error = new Error('Курс не найден');
      error.status = 404;
      return next(error);
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.createCourse = async (req, res, next) => {
  try {
    const { title, description, start_date, end_date, cost } = req.body;
    const course = await Course.create({ title, description, start_date, end_date, cost });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};
