import { useState } from 'react';
import { CreditCard, Repeat, Split, Layers, Heart, CheckCircle2 } from 'lucide-react';
import { PricingTypeCard } from './PricingTypeCard';
import { OneTimeForm } from './forms/OneTimeForm';
import { SubscriptionForm } from './forms/SubscriptionForm';
import { SplitPaymentForm } from './forms/SplitPaymentForm';
import { TieredForm } from './forms/TieredForm';
import { DonationForm } from './forms/DonationForm';
import type { PricingType, OneTimeConfig, SubscriptionConfig, SplitConfig, TieredConfig, DonationConfig } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePlan } from '../hooks';

export const PricingForm = () => {
    // Basic Info
    const [name, setName] = useState('Premium Plan');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<PricingType>('one_time');

    // Config States (Partial to allow empty init)
    const [oneTimeConfig, setOneTimeConfig] = useState<Partial<OneTimeConfig>>({ price: 50, currency: 'USD' });
    const [subConfig, setSubConfig] = useState<Partial<SubscriptionConfig>>({ price: 29, interval: 'month', currency: 'USD' });
    const [splitConfig, setSplitConfig] = useState<Partial<SplitConfig>>({ total_amount: 100, installment_count: 3, interval: 'month', currency: 'USD' });
    const [tieredConfig, setTieredConfig] = useState<Partial<TieredConfig>>({ tiers: [] });
    const [donationConfig, setDonationConfig] = useState<Partial<DonationConfig>>({ min_amount: 5, currency: 'USD' });

    const createPlanMutation = useCreatePlan();

    const handleSubmit = () => {
        const payload: any = {
            name,
            description,
            type: selectedType,
            product_id: "650000000000000000000001", // Dummy ID
            values: ["Recurring revenue", "Upgrade paths"],
        };

        switch (selectedType) {
            case 'one_time': payload.one_time_config = oneTimeConfig; break;
            case 'subscription': payload.subscription_config = subConfig; break;
            case 'split': payload.split_config = splitConfig; break;
            case 'tiered': payload.tiered_config = tieredConfig; break;
            case 'donation': payload.donation_config = donationConfig; break;
        }

        createPlanMutation.mutate(payload);
    };

    // Helper to render preview price
    const renderPreviewPrice = () => {
        switch (selectedType) {
            case 'one_time':
                return `$${oneTimeConfig.price || 0}`;
            case 'subscription':
                return `$${subConfig.price || 0}`;
            case 'split':
                return `$${splitConfig.total_amount || 0}`;
            case 'tiered':
                if (!tieredConfig.tiers?.length) return '$0';
                return `From $${Math.min(...tieredConfig.tiers.map(t => t.unit_price))}`;
            case 'donation':
                return `Min $${donationConfig.min_amount || 0}`;
            default:
                return '$0';
        }
    };

    // Helper for preview subtitle
    const renderPreviewSubtitle = () => {
        switch (selectedType) {
            case 'one_time': return 'Lifetime access';
            case 'subscription': return `/${subConfig.interval || 'month'}`;
            case 'split': return `Total (in ${splitConfig.installment_count || 1} installments)`;
            case 'tiered': return 'Tiered Pricing';
            case 'donation': return 'Pay what you want';
            default: return '';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 max-w-7xl mx-auto">
            {/* Left Column: Sidebar Selection */}
            <div className="lg:col-span-4 space-y-4">
                <h2 className="text-lg font-semibold mb-4">Pricing type</h2>
                <div className="space-y-3">
                    <PricingTypeCard
                        title="One-time Plan"
                        description="Simple one-time payment for lifetime access"
                        icon={CreditCard}
                        isSelected={selectedType === 'one_time'}
                        onClick={() => setSelectedType('one_time')}
                    />
                    <PricingTypeCard
                        title="Split Payment Plan"
                        description="Payment in multiple installments"
                        icon={Split}
                        isSelected={selectedType === 'split'}
                        onClick={() => setSelectedType('split')}
                    />
                    <PricingTypeCard
                        title="Subscription Plan"
                        description="Recurring revenue stream"
                        icon={Repeat}
                        isSelected={selectedType === 'subscription'}
                        onClick={() => setSelectedType('subscription')}
                    />
                    <PricingTypeCard
                        title="Tiered Plan"
                        description="Different prices for different quantities"
                        icon={Layers}
                        isSelected={selectedType === 'tiered'}
                        onClick={() => setSelectedType('tiered')}
                    />
                    <PricingTypeCard
                        title="Donation"
                        description="Pay what you want model"
                        icon={Heart}
                        isSelected={selectedType === 'donation'}
                        onClick={() => setSelectedType('donation')}
                    />
                </div>
            </div>

            {/* Center: Configuration Form */}
            <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Plan Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Best for beginners" />
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        {selectedType === 'one_time' && <OneTimeForm config={oneTimeConfig} onChange={setOneTimeConfig} />}
                        {selectedType === 'subscription' && <SubscriptionForm config={subConfig} onChange={setSubConfig} />}
                        {selectedType === 'split' && <SplitPaymentForm config={splitConfig} onChange={setSplitConfig} />}
                        {selectedType === 'tiered' && <TieredForm config={tieredConfig} onChange={setTieredConfig} />}
                        {selectedType === 'donation' && <DonationForm config={donationConfig} onChange={setDonationConfig} />}
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-3">
                <div className="sticky top-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-slate-500 text-sm">Preview</h3>
                            {/* Eye icon or similar could go here */}
                        </div>

                        <div>
                            <h2 className="text-4xl font-bold text-slate-900">{renderPreviewPrice()}</h2>
                            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                                {selectedType === 'one_time' && <span className="text-lg mr-1">∞</span>}
                                {renderPreviewSubtitle()}
                            </p>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex items-center gap-3 mb-2">
                                {selectedType === 'one_time' && <CreditCard className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'subscription' && <Repeat className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'split' && <Split className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'tiered' && <Layers className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'donation' && <Heart className="w-5 h-5 text-indigo-600" />}
                                <div>
                                    <p className="font-semibold text-indigo-900 leading-tight">{name}</p>
                                    <p className="text-xs text-indigo-700">{selectedType.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={createPlanMutation.isPending}
                        >
                            {createPlanMutation.isPending ? 'Creating...' : 'Buy Now'}
                        </Button>

                        <div className="pt-4 border-t space-y-2">
                            <h4 className="font-semibold text-slate-900 text-sm">Plan Benefits</h4>
                            <ul className="space-y-1">
                                <li className="text-xs text-slate-600 flex gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" /> Recurring revenue
                                </li>
                                <li className="text-xs text-slate-600 flex gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" /> Access to content
                                </li>
                                <li className="text-xs text-slate-600 flex gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" /> Community access
                                </li>
                            </ul>
                        </div>

                        <p className="text-xs text-slate-400 text-center">
                            Need help choosing? <span className="underline cursor-pointer">View pricing guide</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
