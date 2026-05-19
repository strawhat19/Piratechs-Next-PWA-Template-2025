export const stripePaymentsDevEnabled = process.env.NEXT_PUBLIC_STRIPE_DEV_ENABLED == `true`;
export const stripePaymentsEnabled = process.env.NODE_ENV == `production` || stripePaymentsDevEnabled;
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ``;
export const stripeAdvancedFraudSignalsEnabled = process.env.NODE_ENV == `production`;
export const stripePaymentsDisabledMessage = `Stripe payments are disabled in development. Set NEXT_PUBLIC_STRIPE_DEV_ENABLED=true and restart the dev server to test payments locally.`;
export const stripePublishableKeyMissingMessage = `Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY. Add your Stripe publishable key to use internal checkout.`;
