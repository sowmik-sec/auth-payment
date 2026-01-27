import { Link } from '@tanstack/react-router';
import { usePlans } from '../hooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { PricingPlan } from '../types';

export function PricingPage() {
    const { data: plans, isLoading, error } = usePlans();

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-red-500 p-8">Failed to load plans</div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Choose Your Plan</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans?.map((plan: PricingPlan) => (
                    <Card key={plan.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-2xl font-bold mb-4">
                                {formatPrice(plan)}
                            </div>
                            <ul className="space-y-2">
                                {plan.values?.map((val, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        ✓ {val}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link to="/checkout/$planId" params={{ planId: plan.id }} className="w-full">
                                <Button className="w-full">Get Started</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {(!plans || plans.length === 0) && (
                <div className="text-center mt-12">
                    <p className="text-gray-500 mb-4">No plans available immediately.</p>
                    <Link to="/admin/pricing">
                        <Button variant="outline">Create Your First Plan</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

function formatPrice(plan: PricingPlan) {
    if (plan.type === 'one_time') {
        return `$${plan.one_time_config?.price} USD`;
    }
    if (plan.type === 'subscription') {
        return `$${plan.subscription_config?.price} / ${plan.subscription_config?.interval}`;
    }
    return 'Custom Pricing';
}
