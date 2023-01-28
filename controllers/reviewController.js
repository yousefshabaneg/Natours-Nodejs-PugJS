const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

class ReviewsController {
  static setTourUserIds = (req, res, next) => {
    req.body.tour = req.body.tour || req.params.tourId;
    req.body.user = req.body.user || req.user.id;

    next();
  };

  static getAllReviews = factory.getAll(Review);
  static createReview = factory.createOne(Review);
  static getReview = factory.getOne(Review);
  static updateReview = factory.updateOne(Review);
  static deleteReview = factory.deleteOne(Review);
}

module.exports = ReviewsController;
