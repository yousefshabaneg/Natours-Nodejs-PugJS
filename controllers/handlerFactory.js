const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

class Factory {
  static getAll = Model => {
    return catchAsync(async (req, res, next) => {
      //EXECUTE QUERY

      //TO ALLOW NESTED ROUTES GET REVIEWS ON TOUR.
      if (req.params.tourId) req.query.tour = req.params.tourId;

      //TO ALLOW NESTED ROUTES GET User Bookings.
      if (req.params.userId) req.query.user = req.params.userId;

      const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const docs = await features.query;
      // const docs = await features.query.explain();

      // SEND RESPONSE
      res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: docs.length,
        data: {
          data: docs
        }
      });
    });
  };

  static getOne = (Model, popOptions) => {
    return catchAsync(async (req, res, next) => {
      let query = Model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);

      const doc = await query;

      if (!doc) {
        return next(new AppError('Document not found with that ID', 404));
      }
      res.status(200).json({
        status: 'success',
        data: {
          data: doc
        }
      });
    });
  };

  static deleteOne = Model => {
    return catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError(`No document found with that ID`, 404));
      }

      res.status(204).json({
        status: 'success',
        data: null
      });
    });
  };

  static updateOne = Model => {
    return catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc
        },
        message: 'Updated Successfully'
      });
    });
  };

  static createOne = Model => {
    return catchAsync(async (req, res, next) => {
      const newDoc = await Model.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          data: newDoc
        }
      });
    });
  };
}

module.exports = Factory;
