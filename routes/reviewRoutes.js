const router = require('express').Router({ mergeParams: true });
const ReviewController = require('../controllers/reviewController');
const AuthMiddleware = require('../middleware/auth.middleware');

router.use(AuthMiddleware.protect);

router
  .route('/')
  .get(ReviewController.getAllReviews)
  .post(
    AuthMiddleware.restrictTo('user'),
    ReviewController.setTourUserIds,
    ReviewController.createReview
  );
router
  .route('/:id')
  .get(ReviewController.getReview)
  .patch(
    AuthMiddleware.restrictTo('user', 'admin'),
    ReviewController.updateReview
  )
  .delete(
    AuthMiddleware.restrictTo('user', 'admin'),
    ReviewController.deleteReview
  );

module.exports = router;
