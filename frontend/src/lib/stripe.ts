import { loadStripe } from '@stripe/stripe-js';

// Use environment variable for Stripe Publishable Key
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx'; // Fallback only for dev if env missing (but better to fail if missing)

export const stripePromise = loadStripe(stripeKey); 
