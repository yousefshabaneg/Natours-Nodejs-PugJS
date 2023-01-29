const router = require('express').Router();
const ViewsController = require('./../controllers/viewController');
const BookingController = require('./../controllers/bookingController');
const AuthMiddleware = require('../middleware/auth.middleware');

// Allow map box security
router.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://js.stripe.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
  );
  next();
});

router.get('/', AuthMiddleware.isLoggedIn, ViewsController.getOverview);
router.get('/login', AuthMiddleware.isLoggedIn, ViewsController.getLoginForm);
router.get('/tour/:slug', AuthMiddleware.isLoggedIn, ViewsController.getTour);
router.get('/me', AuthMiddleware.protect, ViewsController.getAccount);

router.get('/my-tours', AuthMiddleware.protect, ViewsController.getMyTours);

router.post(
  '/submit-user-data',
  AuthMiddleware.protect,
  ViewsController.updateUserData
);

module.exports = router;
