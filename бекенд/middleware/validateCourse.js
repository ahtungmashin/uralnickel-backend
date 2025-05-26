import { body } from 'express-validator';

export const validateCourse = [
  body('title')
    .notEmpty()
    .withMessage('Название курса обязательно'),

  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Дата начала должна быть валидной датой'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Дата окончания должна быть валидной датой'),

  body('cost')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Стоимость должна быть положительным числом'),

  body('competencies')
    .optional()
    .custom((value) => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(parsed)) throw new Error();
        return true;
      } catch {
        throw new Error('Компетенции должны быть массивом');
      }
    })
];
