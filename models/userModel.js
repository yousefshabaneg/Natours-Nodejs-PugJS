/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
const { promisify } = require('util');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Please tell us your name']
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email address']
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user'
    },
    password: {
      type: String,
      trim: true,
      minLength: 8,
      required: [true, 'Please provide a password']
    },
    passwordConfirm: {
      type: String,
      trim: true,
      minLength: 8,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function(value) {
          return value === this.password;
        },
        message: 'Passwords do not match'
      }
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcryptjs.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //may be token created before.
  next();
});

userSchema.pre(/^find/, function(next) {
  // this points to the current query.
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

userSchema.methods.generateToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
  // user.tokens = user.tokens.concat({ token });
  // await user.save();
  return token;
};

userSchema.statics.verifyToken = async function(token) {
  if (!token) throw new AppError('Error: Token is required', 400);
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  if (!decodedToken._id) throw new AppError('Error: User doest not exist', 404);

  const user = await User.findById(decodedToken._id);
  return { user, decodedToken };
};

userSchema.methods.createPasswordResetToken = async function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10m expire.

  return resetToken;
};

userSchema.statics.resetPassword = async function(
  resetToken,
  password,
  passwordConfirm
) {
  // 1) Get user based on the token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    throw new AppError('Token is invalid or has expired!', 400);
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) return user
  return user;
};

userSchema.methods.updatePassword = async function(
  passwordCurrent,
  newPassword,
  newPasswordConfirm
) {
  // 1) Get user from collection
  const user = this;

  // 2) Check if posted current password is correct.
  const checkPassword = await user.correctPassword(
    passwordCurrent,
    user.password
  );
  if (!checkPassword) throw new AppError('Wrong Password, try again...', 403);

  // 3) If so, update password.
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  // 4) return user.
  return user;
};

userSchema.methods.changesPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimestamp;
  }

  //False means NOT changed
  return false;
};

userSchema.statics.login = async (email, password) => {
  // check if user is exist.
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('User doest not exist', 404);

  // validate password.
  const checkPassword = await user.correctPassword(password, user.password);
  if (!checkPassword) throw new AppError('Wrong Password, try again...', 403);

  //delete password
  delete user.password;
  return user;
};

userSchema.methods.toJSON = function() {
  const data = this.toObject();
  delete data.__v;
  delete data.active;
  delete data.password;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.passwordChangedAt;
  return data;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
