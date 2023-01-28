const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class BookingsController {
  static getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) Get currently booked tour
    const { tourId } = req.params;
    const tour = await Tour.findById(tourId);

    //2) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${
        req.user.id
      }&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.user.id,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
            }
          },
          quantity: 1
        }
      ]
    });

    //3) Create session as response
    res.status(200).json({
      status: 'success',
      session
    });
  });

  static createBookingCheckout = catchAsync(async (req, res, next) => {
    //1) Get currently booked tour
    // this is only TEMPORARY, because it's unsecure: everyone can make bookings without paying.
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();

    //2) Create Booking
    await Booking.create({ tour, user, price });

    res.redirect(req.originalUrl.split('?')[0]); //Root url. without query string.
  });

  static setTourUserId = (req, res, next) => {
    req.body.user = req.body.user || req.params.userId;

    if (req.params.tourId) {
      req.body.tour = req.params.tourId;
    }

    next();
  };

  static getAllBookings = factory.getAll(Booking);
  static createBooking = factory.createOne(Booking);
  static getBooking = factory.getOne(Booking);
  static updateBooking = factory.updateOne(Booking);
  static deleteBooking = factory.deleteOne(Booking);
}

module.exports = BookingsController;
