/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

const publicKey =
  'pk_test_51MUQCVCaMPNeXJNjuSeT8wlifrrqAG63fq0dQuZm514jmGzy5S3Fuls2F9KxN5Iuv2FW1MpdYZCt25x66qpJng9300xhLuPEFI';

const stripe = Stripe(publicKey);

export const bookTour = async tourId => {
  try {
    //1) Get checkout session form API.
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2) Create checkout form + charge credit card.
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
    throw err;
  }
};
