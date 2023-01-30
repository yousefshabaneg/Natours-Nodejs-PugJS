const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const Booking = require('./../models/bookingModel');
const AppError = require('./../utils/appError');
const User = require('../models/userModel');
const { ObjectId } = require('mongoose');
// const factory = require('./handlerFactory');

class ViewsController {
  static alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking') {
      res.locals.alert = `Your booking was successful! Please check your email for a confirmation. 
      If your booking doesn't show up here immediately, please come back later.`;
    }
    next();
  };

  static getOverview = catchAsync(async (req, res, next) => {
    //1) Get tour data frm collection
    const tours = await Tour.find();

    //2) Build Template
    //2) Render Template using the data from 1)
    res.status(200).render('overview', { title: 'All tours', tours });
  });

  static getTour = catchAsync(async (req, res, next) => {
    const { slug } = req.params;
    const tour = await Tour.findOne({ slug }).populate({
      path: 'reviews',
      fields: 'review rating user'
    });

    if (!tour) {
      return next(new AppError('Tour not found with that name', 404));
    }

    res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
  });

  static getMyTours = catchAsync(async (req, res, next) => {
    //1) Find All User Bookings
    const bookings = await Booking.find({ user: req.user.id });

    if (!bookings) {
      return next(
        new AppError('This user does not have any bookings yet.', 404)
      );
    }

    //2) Find tours with the returned ids.
    const tourIDs = bookings.map(b => b.tour.id);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', { title: 'My Tours', tours });
  });

  static getLoginForm = (req, res, next) => {
    res.status(200).render('login', { title: 'Log into your account' });
  };

  static getRegisterForm = (req, res, next) => {
    res.status(200).render('register', { title: 'Create a new account' });
  };

  static updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: req.body.name,
        email: req.body.email
      },
      {
        new: true,
        runValidators: true
      }
    );
    res
      .status(200)
      .render('account', { title: 'Your account', user: updatedUser });
  });

  static getAccount = (req, res, next) => {
    res.status(200).render('account', { title: 'Your account' });
  };
}

module.exports = ViewsController;
