import { body } from 'express-validator';

export const validateProject = [
  body('title')
    .notEmpty()
    .withMessage('Название проекта обязательно'),

  body('description')
    .notEmpty()
    .withMessage('Описание проекта обязательно'),

  body('departments')
    .custom(value => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(parsed)) throw new Error();
        return true;
      } catch {
        throw new Error('departments должен быть массивом строк');
      }
    }),

  body('positions_required')
    .custom(value => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
        return true;
      } catch {
        throw new Error('positions_required должен быть объектом');
      }
    }),

  body('competencies_required')
    .custom(value => {
      try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
        return true;
      } catch {
        throw new Error('competencies_required должен быть объектом');
      }
    }),

  body('startDate')
    .notEmpty()
    .withMessage('Дата начала обязательна')
    .isISO8601()
    .withMessage('startDate должна быть валидной датой'),

  body('managerId')
    .notEmpty()
    .withMessage('ID менеджера обязателен')
    .isInt()
    .withMessage('managerId должен быть числом')
];
