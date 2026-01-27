import type { BundleConfig } from '../../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BundleFormProps {
    config: Partial<BundleConfig>;
    onChange: (config: Partial<BundleConfig>) => void;
}

// Mock products for the prototype
const AVAILABLE_PRODUCTS = [
    { id: 'prod_1', name: 'React Masterclass' },
    { id: 'prod_2', name: 'Advanced TypeScript' },
    { id: 'prod_3', name: 'Node.js Backend Guide' },
    { id: 'prod_4', name: 'UI/UX Design Systems' },
];

export const BundleForm = ({ config, onChange }: BundleFormProps) => {

    const handleProductToggle = (productId: string) => {
        const currentIds = config.included_product_ids || [];
        const newIds = currentIds.includes(productId)
            ? currentIds.filter(id => id !== productId)
            : [...currentIds, productId];

        onChange({ ...config, included_product_ids: newIds });
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Bundle Price</Label>
                    <Input
                        type="number"
                        value={config.price || ''}
                        onChange={(e) => onChange({ ...config, price: Number(e.target.value) })}
                        className="h-9"
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Original Price</Label>
                    <Input
                        type="number"
                        value={config.original_price || ''}
                        onChange={(e) => onChange({ ...config, original_price: Number(e.target.value) })}
                        className="h-9"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <Label>Included Products</Label>
                <div className="grid grid-cols-1 gap-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                    {AVAILABLE_PRODUCTS.map(product => (
                        <div key={product.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer" onClick={() => handleProductToggle(product.id)}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${config.included_product_ids?.includes(product.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                {config.included_product_ids?.includes(product.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <span className="text-sm text-slate-700">{product.name}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-slate-500">Select the products included in this bundle.</p>
            </div>
        </div>
    );
};
