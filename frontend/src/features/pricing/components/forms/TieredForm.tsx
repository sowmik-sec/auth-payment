import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { TieredConfig, TierItem } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    config: Partial<TieredConfig>;
    onChange: (config: Partial<TieredConfig>) => void;
}

export const TieredForm = ({ config, onChange }: Props) => {
    const tiers = config.tiers || [];

    const addTier = () => {
        const newTier: TierItem = {
            name: `Tier ${tiers.length + 1}`,
            min_qty: 1,
            max_qty: 10,
            unit_price: 10
        };
        onChange({ ...config, tiers: [...tiers, newTier] });
    };

    const removeTier = (index: number) => {
        const newTiers = [...tiers];
        newTiers.splice(index, 1);
        onChange({ ...config, tiers: newTiers });
    };

    const updateTier = (index: number, field: keyof TierItem, value: any) => {
        const newTiers = [...tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        onChange({ ...config, tiers: newTiers });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Pricing Tiers needs to be sequential</Label>
                <Button variant="outline" size="sm" onClick={addTier} type="button">
                    <Plus className="w-4 h-4 mr-2" /> Add Tier
                </Button>
            </div>

            {tiers.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md text-slate-500 text-sm">
                    No tiers added yet. Click "Add Tier" to start.
                </div>
            )}

            <div className="space-y-3">
                {tiers.map((tier, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-slate-50">
                        <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Name</Label>
                            <Input
                                value={tier.name}
                                onChange={(e) => updateTier(index, 'name', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Min Qty</Label>
                            <Input
                                type="number"
                                value={tier.min_qty}
                                onChange={(e) => updateTier(index, 'min_qty', Number(e.target.value))}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="col-span-2 space-y-1">
                            <Label className="text-xs">Max Qty</Label>
                            <Input
                                type="number"
                                value={tier.max_qty === -1 ? '' : tier.max_qty}
                                placeholder="∞"
                                onChange={(e) => updateTier(index, 'max_qty', e.target.value === '' ? -1 : Number(e.target.value))}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="col-span-3 space-y-1">
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                                type="number"
                                value={tier.unit_price}
                                onChange={(e) => updateTier(index, 'unit_price', Number(e.target.value))}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="col-span-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeTier(index)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
