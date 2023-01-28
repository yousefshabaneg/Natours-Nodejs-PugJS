const AppError = require('../utils/appError');
const { filterObj } = require('../utils/utils');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

class UserController {
  static getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
  };

  static updateMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user posts password data.
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates, please use /updateMyPassword',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated.
    const filteredBody = filterObj(req.body, 'name', 'email');

    if (req.file) filteredBody.photo = req.file.filename;

    // 3) Update user data.
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      { new: true, runValidators: true }
    );
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  });
  static deleteMe = catchAsync(async (req, res, next) => {
    // 1) Create error if user posts password data.
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({ status: 'success', data: null });
  });

  static getAllUsers = factory.getAll(User);
  static getUser = factory.getOne(User);
  static updateUser = factory.updateOne(User);
  static deleteUser = factory.deleteOne(User);
}

module.exports = UserController;
