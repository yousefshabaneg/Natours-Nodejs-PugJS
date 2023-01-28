const router = require('express').Router();
const tourController = require('../controllers/tourController');
const AuthMiddleware = require('../middleware/auth.middleware');
const reviewRouter = require('./../routes/reviewRoutes');
// const bookingRouter = require('./../routes/bookingRoutes');

const {
  uploadTourImages,
  resizeTourImages
} = require('./../middleware/multer.middleware');

// POST  /tour/234fad4/reviews
// GET  /tour/234fad4/reviews
// GET  /tour/234fad4/reviews/123456

// router
//   .route('/:tourId/reviews')
//   .post(
//     AuthMiddleware.protect,
//     AuthMiddleware.restrictTo('user'),
//     reviewController.createReview
//   );

router.use('/:tourId/reviews', reviewRouter);
// router.use('/:tourId/bookings', bookingRouter);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    AuthMiddleware.protect,
    AuthMiddleware.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    AuthMiddleware.protect,
    AuthMiddleware.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    AuthMiddleware.protect,
    AuthMiddleware.restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    tourController.updateTour
  )
  .delete(
    AuthMiddleware.protect,
    AuthMiddleware.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
