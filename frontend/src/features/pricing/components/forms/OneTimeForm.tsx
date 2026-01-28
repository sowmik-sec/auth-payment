import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OneTimeConfig } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';

interface Props {
    config: Partial<OneTimeConfig>;
    onChange: (config: Partial<OneTimeConfig>) => void;
}

export const OneTimeForm = ({ config, onChange }: Props) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
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
                    <Label>Original Price</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                            {SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}
                        </span>
                        <Input
                            type="number"
                            min="0"
                            placeholder="50.0"
                            value={config.original_price || ''}
                            onChange={(e) => onChange({ ...config, original_price: Number(e.target.value) })}
                            className="pl-7"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Offer Price</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">
                            {SUPPORTED_CURRENCIES.find(c => c.code === config.currency)?.symbol || '$'}
                        </span>
                        <Input
                            type="number"
                            min="0"
                            placeholder="40.0"
                            value={config.price || ''}
                            onChange={(e) => onChange({ ...config, price: Number(e.target.value) })}
                            className="pl-7"
                        />
                    </div>
                </div>
            </div>

            {/* Future: Add Offer Price / Sale Price logic here if needed */}
        </div>
    );
};
