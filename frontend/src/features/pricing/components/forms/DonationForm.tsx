import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DonationConfig } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

interface Props {
    config: Partial<DonationConfig>;
    onChange: (config: Partial<DonationConfig>) => void;
}

export const DonationForm = ({ config, onChange }: Props) => {
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
                <Label>Minimum Amount</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                        {SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}
                    </span>
                    <Input
                        type="number"
                        min="0"
                        value={config.min_amount || ''}
                        onChange={(e) => onChange({ ...config, min_amount: Number(e.target.value) })}
                        className="pl-7"
                    />
                </div>
                <p className="text-xs text-slate-500">The lowest amount a user can pay.</p>
            </div>

            <div className="space-y-2">
                <Label>Suggested Amount (Optional)</Label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                        {SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}
                    </span>
                    <Input
                        type="number"
                        min="0"
                        value={config.suggested_amount || ''}
                        onChange={(e) => onChange({ ...config, suggested_amount: Number(e.target.value) })}
                        className="pl-7"
                    />
                </div>
                <p className="text-xs text-slate-500">Pre-filled amount for convenience.</p>
            </div>
        </div>
    );
};
