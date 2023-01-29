const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class BookingsController {
  static getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) Get currently booked tour
    const { tourId } = req.params;
    const tour = await Tour.findById(tourId);

    //2) Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      // /my-tours/?tour=${tourId}&user=${req.user.id}&price=${tour.price}`//before webhooks,
      success_url: `${req.protocol}://${req.get('host')}/my-tours`,
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
              images: [
                `${req.protocol}://${req.get('host')}/img/tours/${
                  tour.imageCover
                }`
              ]
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

  static webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      this._createBookingCheckout(event.data.object);
      res.status(200).json({ received: true });
    }
  };

  static _createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.line_items[0].price_data.unit_amount / 100;
    await Booking.create({ tour, user, price });
  };

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
