import express from 'express';
import router from express.Router();
import userController from ('../controllers/userController');
import auth from ('../middleware/auth');

router.get('/profile', auth, userController.getProfile);

export default router;