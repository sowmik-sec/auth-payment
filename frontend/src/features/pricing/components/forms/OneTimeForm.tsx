import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OneTimeConfig } from '../../types';

interface Props {
    config: Partial<OneTimeConfig>;
    onChange: (config: Partial<OneTimeConfig>) => void;
}

export const OneTimeForm = ({ config, onChange }: Props) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Original Price</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
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
                        <span className="absolute left-3 top-2.5 text-slate-500">$</span>
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
