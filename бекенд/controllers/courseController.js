import { Course } from '../models';

export const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getCourseById = async (req, res, next) => {
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

export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      start_date,
      end_date,
      cost,
      departments = '[]',
      competencies = '[]',
      link
    } = req.body;

    const photo = req.file ? `/uploads/courses/${req.file.filename}` : null;

    const course = await Course.create({
      title,
      description,
      start_date,
      end_date,
      cost,
      departments: JSON.parse(departments),
      competencies: JSON.parse(competencies),
      link,
      photo
    });

    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      const error = new Error('Курс не найден');
      error.status = 404;
      return next(error);
    }

    const {
      title,
      description,
      start_date,
      end_date,
      cost,
      departments,
      competencies,
      link
    } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (start_date) course.start_date = start_date;
    if (end_date) course.end_date = end_date;
    if (cost) course.cost = cost;
    if (departments) course.departments = JSON.parse(departments);
    if (competencies) course.competencies = JSON.parse(competencies);
    if (link) course.link = link;
    if (req.file) course.photo = `/uploads/courses/${req.file.filename}`;

    await course.save();
    res.json(course);
  } catch (err) {
    next(err);
  }
};
