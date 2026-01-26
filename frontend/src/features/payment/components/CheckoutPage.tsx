import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
// import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { paymentApi } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message ?? "An unexpected error occurred.");
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

            {message && <div className="text-red-500 text-sm">{message}</div>}

            <Button disabled={isLoading || !stripe || !elements} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {isLoading ? <span className="animate-spin mr-2">◌</span> : <Lock className="w-4 h-4 mr-2" />}
                {isLoading ? "Processing..." : "Pay Now"}
            </Button>

            <div className="flex justify-center items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" /> Secure formatted 256-bit SSL encryption.
            </div>
        </form>
    );
};

export const CheckoutPage = () => {
    // We would use type safe params here in a larger app
    // const { planId } = Route.useParams(); 
    // Fallback for now since I'm not editing route definitions yet
    const params = useParams({ strict: false });
    const planId = (params as any).planId;

    const [clientSecret, setClientSecret] = useState("");

    useEffect(() => {
        if (planId) {
            paymentApi.initiateCheckout(planId)
                .then(data => setClientSecret(data.client_secret))
                .catch(err => console.error(err));
        }
    }, [planId]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="text-center border-b border-slate-100 pb-6">
                    <CardTitle className="text-2xl font-bold text-slate-900">Secure Checkout</CardTitle>
                    <CardDescription>Complete your purchase securely</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {clientSecret ? (
                        <Elements options={{ clientSecret, appearance: { theme: 'stripe' } }} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    ) : (
                        <div className="flex justify-center p-8">
                            <span className="animate-pulse text-slate-400">Loading payment details...</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
