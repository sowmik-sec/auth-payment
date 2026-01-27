import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SubscriptionConfig, RecurringInterval } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

interface Props {
    config: Partial<SubscriptionConfig>;
    onChange: (config: Partial<SubscriptionConfig>) => void;
}

export const SubscriptionForm = ({ config, onChange }: Props) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="year">Yearly</SelectItem>
                            <SelectItem value="week">Weekly</SelectItem>
                            <SelectItem value="day">Daily</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Price</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-500">$</span>
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
                            <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                            <Input
                                type="number"
                                min="0"
                                placeholder="Offer"
                                value={config.price || ''}
                                onChange={(e) => onChange({ ...config, price: Number(e.target.value) })}
                                className="pl-7"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Trial Days (Optional)</Label>
                <Input
                    type="number"
                    min="0"
                    value={config.trial_days || ''}
                    onChange={(e) => onChange({ ...config, trial_days: Number(e.target.value) })}
                    placeholder="e.g. 7"
                />
            </div>
        </div>
    );
};
