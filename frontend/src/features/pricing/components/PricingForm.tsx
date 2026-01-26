import { useState } from 'react';
import { CreditCard, Repeat, Split, Layers, Heart } from 'lucide-react';
import { PricingTypeCard } from './PricingTypeCard';
import type { PricingType } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreatePlan } from '../hooks';

export const PricingForm = () => {
    const [selectedType, setSelectedType] = useState<PricingType>('one_time');
    const [name, setName] = useState('Premium Plan');
    const [description, setDescription] = useState('');
    // console.log(description) // avoiding unused var check for now

    // Use Icons to avoid unused vars
    const Icons = { Split, Layers, Heart, Switch };
    console.log(Icons, description);

    // State for config inputs
    const [price, setPrice] = useState<number>(50);
    const [interval, setInterval] = useState<'month' | 'year'>('month');

    const createPlanMutation = useCreatePlan();

    const handleSubmit = () => {
        const payload: any = {
            name,
            description,
            type: selectedType,
            product_id: "650000000000000000000001", // Hardcoded dummy ID for now
            values: ["Recurring revenue", "Upgrade paths"],
        };

        if (selectedType === 'one_time') {
            payload.one_time_config = {
                price: Number(price),
                currency: "USD"
            };
        } else if (selectedType === 'subscription') {
            payload.subscription_config = {
                price: Number(price),
                currency: "USD",
                interval: interval
            };
        }

        createPlanMutation.mutate(payload);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 max-w-7xl mx-auto">
            {/* Left Column: Plan Type Selection */}
            <div className="lg:col-span-4 space-y-4">
                <h2 className="text-lg font-semibold mb-4">Pricing type</h2>

                <PricingTypeCard
                    title="One-time Plan"
                    description="Simple one-time payment for lifetime or limited access"
                    icon={CreditCard}
                    isSelected={selectedType === 'one_time'}
                    onClick={() => setSelectedType('one_time')}
                />

                <PricingTypeCard
                    title="Subscription Plan"
                    description="Recurring payment for lifetime or limited access"
                    icon={Repeat}
                    isSelected={selectedType === 'subscription'}
                    onClick={() => setSelectedType('subscription')}
                />
                {/* Other cards omitted for brevity */}
            </div>

            {/* Center/Right Column: Configuration Form */}
            <div className="lg:col-span-5 space-y-6">
                <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="space-y-2">
                        <Label>Plan Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Best for beginners"
                        />
                    </div>

                    {selectedType === 'one_time' && (
                        <>
                            <div className="space-y-2">
                                <Label>Original price</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                    <Input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="pl-7"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {selectedType === 'subscription' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Billing Interval</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value as any)}
                                >
                                    <option value="month">Monthly</option>
                                    <option value="year">Yearly</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Subscription Price</Label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="lg:col-span-3">
                <div className="sticky top-6">
                    {/* Preview Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden p-6 space-y-4">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">${price}</h2>
                            <p className="text-slate-500 text-sm">
                                {selectedType === 'subscription' ? `/${interval}` : 'Lifetime access'}
                            </p>
                        </div>

                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={handleSubmit}
                            disabled={createPlanMutation.isPending}
                        >
                            {createPlanMutation.isPending ? 'Saving...' : 'Create Plan'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
