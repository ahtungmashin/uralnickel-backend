// middleware/validateCertificate.js
import { body } from 'express-validator';

export default [
  body('course_id')
    .notEmpty()
    .withMessage('course_id обязателен')
    .isInt()
    .withMessage('course_id должен быть числом'),
];
