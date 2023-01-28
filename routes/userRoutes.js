const router = require('express').Router();
const UserController = require('../controllers/userController');
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/auth.middleware');
const bookingRouter = require('./../routes/bookingRoutes');
const {
  uploadUserPhoto,
  resizeUserPhoto
} = require('./../middleware/multer.middleware');

router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.get('/logout', AuthController.logout);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch('/resetPassword/:token', AuthController.resetPassword);

//Start using the current token
router.use(AuthMiddleware.protect);

router.patch('/updateMyPassword', AuthController.updatePassword);
router
  .route('/me')
  .get(UserController.getMe, UserController.getUser)
  .patch(uploadUserPhoto, resizeUserPhoto, UserController.updateMe)
  .delete(UserController.deleteMe);

//Admin protection.
router.use(AuthMiddleware.restrictTo('admin'));

router.use('/:userId/:tourId?/bookings', bookingRouter);

router.route('/').get(UserController.getAllUsers);

router
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = router;
