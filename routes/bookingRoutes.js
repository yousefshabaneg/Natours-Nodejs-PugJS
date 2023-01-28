const router = require('express').Router({ mergeParams: true });
const BookingController = require('./../controllers/bookingController');
const AuthMiddleware = require('../middleware/auth.middleware');

router.use(AuthMiddleware.protect);

router.get(
  '/checkout-session/:tourId',

  BookingController.getCheckoutSession
);

router.use(AuthMiddleware.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(BookingController.getAllBookings)
  .post(BookingController.setTourUserId, BookingController.createBooking);

router
  .route('/:id')
  .get(BookingController.getBooking)
  .patch(BookingController.updateBooking)
  .delete(BookingController.deleteBooking);

module.exports = router;
