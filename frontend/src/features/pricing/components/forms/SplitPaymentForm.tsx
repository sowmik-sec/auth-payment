import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SplitConfig, RecurringInterval } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

interface Props {
    config: Partial<SplitConfig>;
    onChange: (config: Partial<SplitConfig>) => void;
}

export const SplitPaymentForm = ({ config, onChange }: Props) => {
    // Calculate monthly payment for display
    const installmentAmount = (config.total_amount && config.installment_count)
        ? (config.total_amount - (config.upfront_payment || 0)) / config.installment_count
        : 0;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                    value={config.currency || 'USD'}
                    onValueChange={(val) => onChange({ ...config, currency: val })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                        {SUPPORTED_CURRENCIES.map(curr => (
                            <SelectItem key={curr.code} value={curr.code}>
                                {curr.code} - {curr.name} ({curr.symbol})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Total Price</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                            {SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}
                        </span>
                        <Input
                            type="number"
                            min="0"
                            placeholder="Original"
                            value={config.original_price || ''}
                            onChange={(e) => onChange({ ...config, original_price: Number(e.target.value) })}
                            className="pl-7"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                            {SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}
                        </span>
                        <Input
                            type="number"
                            min="0"
                            placeholder="Offer"
                            value={config.total_amount || ''}
                            onChange={(e) => onChange({ ...config, total_amount: Number(e.target.value) })}
                            className="pl-7"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Number of Installments</Label>
                    <Input
                        type="number"
                        min="2"
                        value={config.installment_count || ''}
                        onChange={(e) => onChange({ ...config, installment_count: Number(e.target.value) })}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Billing Interval</Label>
                    <Select
                        value={config.interval || 'month'}
                        onValueChange={(val) => onChange({ ...config, interval: val as RecurringInterval })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="month">Monthly</SelectItem>
                            <SelectItem value="week">Weekly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Upfront Payment (Optional)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                        {SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}
                    </span>
                    <Input
                        type="number"
                        min="0"
                        value={config.upfront_payment || ''}
                        onChange={(e) => onChange({ ...config, upfront_payment: Number(e.target.value) })}
                        className="pl-7"
                    />
                </div>
            </div>

            {installmentAmount > 0 && (
                <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600">
                    Students will pay <strong>{SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}{installmentAmount.toFixed(2)}</strong> / {config.interval || 'month'} for {config.installment_count} installments.
                </div>
            )}
        </div>
    );
};
