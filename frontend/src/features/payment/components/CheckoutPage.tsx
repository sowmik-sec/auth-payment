import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { paymentApi } from '../api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import { usePlan } from '@/features/pricing/hooks';
import type { PricingPlan } from '@/features/pricing/types';

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
    const params = useParams({ strict: false });
    const planId = (params as any).planId;

    const { data: plan, isLoading: isPlanLoading, error: planError } = usePlan(planId);

    // Dynamic State
    const [donationAmount, setDonationAmount] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(1);

    // Checkout State
    const [clientSecret, setClientSecret] = useState("");
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [step, setStep] = useState<'config' | 'payment'>('config');

    // Initialize defaults when plan loads
    useEffect(() => {
        if (plan) {
            if (plan.type === 'donation' && plan.donation_config) {
                setDonationAmount(plan.donation_config.min_amount || 5);
            }
            if (plan.type === 'tiered') {
                setQuantity(1);
            }
            // For others, we can skip config step if we want, or show a review.
            // Let's autoskip for simple types to keep it fast
            if (plan.type === 'one_time' || plan.type === 'subscription' || plan.type === 'split') {
                setStep('payment');
            }
        }
    }, [plan]);

    // Effect to initialize checkout when entering payment step
    useEffect(() => {
        if (step === 'payment' && plan && !clientSecret) {
            const payload: any = { planId };

            if (plan.type === 'donation') payload.amount = donationAmount;
            if (plan.type === 'tiered') payload.quantity = quantity;

            // Manual call instead of using paymentApi.initiateCheckout wrapper which might not support args yet
            // Actually, let's update call
            paymentApi.initiateCheckout(planId, undefined, plan.type === 'donation' ? donationAmount : undefined, plan.type === 'tiered' ? quantity : undefined)
                .then(data => setClientSecret(data.client_secret))
                .catch(err => {
                    console.error(err);
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        window.location.href = '/login';
                    } else {
                        setCheckoutError("Failed to initialize checkout. Please try again.");
                    }
                });
        }
    }, [step, plan, planId, donationAmount, quantity, clientSecret]);

    if (isPlanLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading plan details...</div>;
    }

    if (planError || !plan) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load plan details.</div>;
    }

    // Config Step (Donation/Tiered)
    if (step === 'config') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-slate-200">
                    <CardHeader>
                        <CardTitle>Configure {plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {plan.type === 'donation' && (
                            <div className="space-y-2">
                                <Label>Enter Amount ({plan.donation_config?.currency})</Label>
                                <Input
                                    type="number"
                                    min={plan.donation_config?.min_amount}
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(Number(e.target.value))}
                                />
                                <p className="text-xs text-slate-500">Minimum: {plan.donation_config?.currency} {plan.donation_config?.min_amount}</p>
                            </div>
                        )}
                        {plan.type === 'tiered' && (
                            <div className="space-y-2">
                                <Label>Quantity</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => setStep('payment')}>
                            Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    // Payment Step
    if (checkoutError) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-xl border-slate-200">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-red-600">Error</CardTitle>
                        <CardDescription>{checkoutError}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => setStep('config')} className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-slate-200">
                <CardHeader className="text-center border-b border-slate-100 pb-6">
                    <CardTitle className="text-2xl font-bold text-slate-900">Secure Checkout</CardTitle>
                    <CardDescription>
                        Payment for <strong>{plan.name}</strong>
                        {plan.type === 'donation' && <span> (${donationAmount})</span>}
                        {plan.type === 'tiered' && <span> ({quantity} items)</span>}
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {clientSecret && clientSecret.startsWith('pi_mock') ? (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm">
                                <strong>Test Mode:</strong> Stripe is running in mock mode. No real payment will be processed.
                            </div>
                            <Button
                                onClick={() => window.location.href = '/payment/success'}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Simulate Successful Payment
                            </Button>
                        </div>
                    ) : clientSecret ? (
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
