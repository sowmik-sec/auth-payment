import { loadStripe } from '@stripe/stripe-js';

// TODO: Replace with env var import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
// Using a placeholder public key for development
export const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); 
