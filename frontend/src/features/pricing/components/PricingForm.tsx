import { useState } from 'react';
import { CreditCard, Repeat, Split, Layers, Heart, CheckCircle2, Package } from 'lucide-react';
import { PricingTypeCard } from './PricingTypeCard';
import { OneTimeForm } from './forms/OneTimeForm';
import { SubscriptionForm } from './forms/SubscriptionForm';
import { SplitPaymentForm } from './forms/SplitPaymentForm';
import { TieredForm } from './forms/TieredForm';
import { DonationForm } from './forms/DonationForm';
import { BundleForm } from './forms/BundleForm';
import { UpsellForm } from './forms/UpsellForm';
import type { PricingType, OneTimeConfig, SubscriptionConfig, SplitConfig, TieredConfig, DonationConfig, BundleConfig, UpsellConfig } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePlan } from '../hooks';

export const PricingForm = () => {
    // Basic Info
    const [name, setName] = useState('Premium Plan');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<PricingType>('one_time');

    // Features (Benefits)
    const [features, setFeatures] = useState<string[]>(['Access to all content', 'Priority support']);

    // Constraints State
    const [accessType, setAccessType] = useState<'lifetime' | 'limited'>('lifetime');
    const [accessDuration, setAccessDuration] = useState<number>(365);
    const [allowCoupons, setAllowCoupons] = useState(false);
    const [limitedSellEnabled, setLimitedSellEnabled] = useState(false);
    const [maxQuantity, setMaxQuantity] = useState<number>(100);
    const [earlyBirdEnabled, setEarlyBirdEnabled] = useState(false);
    const [earlyBirdDiscount, setEarlyBirdDiscount] = useState<number>(0);
    const [earlyBirdDeadline, setEarlyBirdDeadline] = useState<string>('');
    const [upsellEnabled, setUpsellEnabled] = useState(false);

    // Config States (Partial to allow empty init)
    const [oneTimeConfig, setOneTimeConfig] = useState<Partial<OneTimeConfig>>({ price: 50, currency: 'USD' });
    const [subConfig, setSubConfig] = useState<Partial<SubscriptionConfig>>({ price: 29, interval: 'month', currency: 'USD' });
    const [splitConfig, setSplitConfig] = useState<Partial<SplitConfig>>({ total_amount: 100, installment_count: 3, interval: 'month', currency: 'USD' });
    const [tieredConfig, setTieredConfig] = useState<Partial<TieredConfig>>({ tiers: [] });
    const [donationConfig, setDonationConfig] = useState<Partial<DonationConfig>>({ min_amount: 5, currency: 'USD' });
    const [bundleConfig, setBundleConfig] = useState<Partial<BundleConfig>>({ price: 99, included_product_ids: [] });
    const [upsellConfig, setUpsellConfig] = useState<Partial<UpsellConfig>>({ upsell_product_ids: [] });

    const createPlanMutation = useCreatePlan();

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features];
        newFeatures[index] = value;
        setFeatures(newFeatures);
    };

    const addFeature = () => setFeatures([...features, '']);
    const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));

    const handleSubmit = () => {
        const payload: any = {
            name,
            description,
            type: selectedType,
            product_id: "650000000000000000000001", // Dummy ID
            values: features.filter(f => f.trim() !== ''),
            allow_coupons: allowCoupons,
        };

        if (accessType === 'limited') {
            payload.access_duration = { duration_days: accessDuration };
        }

        if (limitedSellEnabled) {
            payload.limited_sell = { max_quantity: maxQuantity, sold_count: 0 };
        }

        if (earlyBirdEnabled) {
            payload.early_bird = {
                discount_amount: earlyBirdDiscount,
                deadline: new Date(earlyBirdDeadline).toISOString()
            };
        }

        if (upsellEnabled) {
            payload.upsell_config = upsellConfig;
        }

        switch (selectedType) {
            case 'one_time': payload.one_time_config = oneTimeConfig; break;
            case 'subscription': payload.subscription_config = subConfig; break;
            case 'split': payload.split_config = splitConfig; break;
            case 'tiered': payload.tiered_config = tieredConfig; break;
            case 'donation': payload.donation_config = donationConfig; break;
            case 'bundle': payload.bundle_config = bundleConfig; break;
        }

        createPlanMutation.mutate(payload);
    };

    // Helper to render preview price with discount logic
    const renderPreviewPrice = () => {
        let original = 0;
        let current = 0;

        switch (selectedType) {
            case 'one_time':
                current = oneTimeConfig.price || 0;
                original = oneTimeConfig.original_price || 0;
                break;
            case 'subscription':
                current = subConfig.price || 0;
                original = subConfig.original_price || 0;
                break;
            case 'split':
                current = splitConfig.total_amount || 0;
                original = splitConfig.original_price || 0;
                break;
            case 'tiered':
                if (!tieredConfig.tiers?.length) return '$0';
                return `From $${Math.min(...tieredConfig.tiers.map(t => t.unit_price))}`;
            case 'donation':
                return `Min $${donationConfig.min_amount || 0}`;
            case 'bundle':
                current = bundleConfig.price || 0;
                original = bundleConfig.original_price || 0;
                break;
        }

        if (original > current && (selectedType === 'one_time' || selectedType === 'subscription' || selectedType === 'split' || selectedType === 'bundle')) {
            return (
                <div className="flex flex-col">
                    <span className="text-lg text-slate-400 line-through decoration-slate-400 decoration-2">${original}</span>
                    <span>${current}</span>
                </div>
            );
        }
        return `$${current || 0}`;
    };

    // Helper for preview subtitle
    const renderPreviewSubtitle = () => {
        switch (selectedType) {
            case 'one_time': return accessType === 'lifetime' ? 'Lifetime access' : `${accessDuration} days access`;
            case 'subscription':
                const setupFeeText = subConfig.setup_fee ? ` + $${subConfig.setup_fee} setup fee` : '';
                return `/${subConfig.interval || 'month'}${setupFeeText}`;
            case 'split': return `Total (in ${splitConfig.installment_count || 1} installments)`;
            case 'tiered': return 'Tiered Pricing';
            case 'donation': return 'Pay what you want';
            case 'bundle': return `${bundleConfig.included_product_ids?.length || 0} Products Included`;
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
                    <PricingTypeCard
                        title="Bundle"
                        description="Sell multiple products together"
                        icon={Package}
                        isSelected={selectedType === 'bundle'}
                        onClick={() => setSelectedType('bundle')}
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

                        {/* Features Editor */}
                        <div className="space-y-2">
                            <Label>Plan Benefits (Features)</Label>
                            <div className="space-y-2">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="e.g. 24/7 Support"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addFeature}
                                    className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                    + Add Benefit
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        {selectedType === 'one_time' && <OneTimeForm config={oneTimeConfig} onChange={setOneTimeConfig} />}
                        {selectedType === 'subscription' && <SubscriptionForm config={subConfig} onChange={setSubConfig} />}
                        {selectedType === 'split' && <SplitPaymentForm config={splitConfig} onChange={setSplitConfig} />}
                        {selectedType === 'tiered' && <TieredForm config={tieredConfig} onChange={setTieredConfig} />}
                        {selectedType === 'donation' && <DonationForm config={donationConfig} onChange={setDonationConfig} />}
                        {selectedType === 'bundle' && <BundleForm config={bundleConfig} onChange={setBundleConfig} />}
                    </div>

                    {/* Course Access Duration */}
                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                            <Label className="text-base">Course access duration</Label>
                            <div className="text-slate-400" title="How long user keeps access">ⓘ</div>
                        </div>
                        <div className="border rounded-md p-4 space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="access-lifetime"
                                    checked={accessType === 'lifetime'}
                                    onChange={() => setAccessType('lifetime')}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                    name="accessType"
                                />
                                <Label htmlFor="access-lifetime" className="font-normal cursor-pointer">Lifetime access</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="access-limited"
                                    checked={accessType === 'limited'}
                                    onChange={() => setAccessType('limited')}
                                    className="text-indigo-600 focus:ring-indigo-500"
                                    name="accessType"
                                />
                                <Label htmlFor="access-limited" className="font-normal cursor-pointer">Limited time access</Label>
                            </div>

                            {accessType === 'limited' && (
                                <div className="pl-6 pt-1">
                                    <Label className="text-xs text-slate-500 mb-1 block">Duration (days)</Label>
                                    <Input
                                        type="number"
                                        value={accessDuration}
                                        onChange={(e) => setAccessDuration(Number(e.target.value))}
                                        className="w-32 h-8"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Advance Options */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2">
                            <Label className="text-base">Advance option</Label>
                            <div className="text-slate-400" title="Extra settings">ⓘ</div>
                        </div>

                        <div className="border rounded-md divide-y">
                            {/* Coupon Code */}
                            <div className="flex items-center justify-between p-4">
                                <span className="text-sm font-medium text-slate-700">Coupon code</span>
                                <div
                                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${allowCoupons ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    onClick={() => setAllowCoupons(!allowCoupons)}
                                >
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${allowCoupons ? 'translate-x-5' : ''}`}></div>
                                </div>
                            </div>

                            {/* Limited Sell */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Limited sell</span>
                                    <div
                                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${limitedSellEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        onClick={() => setLimitedSellEnabled(!limitedSellEnabled)}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${limitedSellEnabled ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>
                                {limitedSellEnabled && (
                                    <div className="flex items-center gap-2 animate-in slide-in-from-top-1">
                                        <Label className="text-xs">Max Quantity:</Label>
                                        <Input
                                            type="number"
                                            value={maxQuantity}
                                            onChange={(e) => setMaxQuantity(Number(e.target.value))}
                                            className="w-24 h-8"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Early Bird */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Early bird pricing</span>
                                    <div
                                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${earlyBirdEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        onClick={() => setEarlyBirdEnabled(!earlyBirdEnabled)}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${earlyBirdEnabled ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>
                                {earlyBirdEnabled && (
                                    <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs">Discount Amount</Label>
                                            <Input
                                                type="number"
                                                value={earlyBirdDiscount}
                                                onChange={(e) => setEarlyBirdDiscount(Number(e.target.value))}
                                                className="h-8"
                                                placeholder="e.g. 10.0"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Deadline</Label>
                                            <Input
                                                type="date"
                                                value={earlyBirdDeadline}
                                                onChange={(e) => setEarlyBirdDeadline(e.target.value)}
                                                className="h-8"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Upsells */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-700">Upsells (Order Bumps)</span>
                                    <div
                                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${upsellEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        onClick={() => setUpsellEnabled(!upsellEnabled)}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${upsellEnabled ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                </div>

                                {upsellEnabled && (
                                    <div className="animate-in slide-in-from-top-1">
                                        <UpsellForm config={upsellConfig} onChange={setUpsellConfig} />
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-3">
                <div className="sticky top-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden p-6 space-y-6">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-slate-500 text-slate-500 text-xs uppercase tracking-wider">Live Preview</h3>
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                Preview
                            </span>
                        </div>

                        <div>
                            <h2 className="text-4xl font-bold text-slate-900">{renderPreviewPrice()}</h2>
                            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                                {selectedType === 'one_time' && <span className="text-lg mr-1">∞</span>}
                                {renderPreviewSubtitle()}
                            </p>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 relative overflow-hidden">
                            {/* Optional: Add badge for limited sell or sale */}
                            {limitedSellEnabled && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">
                                    ONLY {maxQuantity} LEFT
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-2">
                                {selectedType === 'one_time' && <CreditCard className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'subscription' && <Repeat className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'split' && <Split className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'tiered' && <Layers className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'donation' && <Heart className="w-5 h-5 text-indigo-600" />}
                                {selectedType === 'bundle' && <Package className="w-5 h-5 text-indigo-600" />}
                                <div>
                                    <p className="font-semibold text-indigo-900 leading-tight">{name || 'Plan Name'}</p>
                                    <p className="text-xs text-indigo-700">{selectedType.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={createPlanMutation.isPending}
                            >
                                {createPlanMutation.isPending ? 'Creating Plan...' : 'Create Plan'}
                            </Button>
                            <p className="text-[10px] text-center text-slate-400">
                                (Public button label will be "Get Started")
                            </p>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 bg-white/50 transition-opacity">
                            <span className="bg-black/80 text-white px-3 py-1 rounded-full text-xs font-medium">Preview Mode</span>
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            <h4 className="font-semibold text-slate-900 text-sm">Plan Benefits</h4>
                            <ul className="space-y-1">
                                {features.length > 0 ? (
                                    features.map((feature, i) => (
                                        feature.trim() && (
                                            <li key={i} className="text-xs text-slate-600 flex gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" /> {feature}
                                            </li>
                                        )
                                    ))
                                ) : (
                                    <li className="text-xs text-slate-400 italic">No benefits added yet.</li>
                                )}
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
