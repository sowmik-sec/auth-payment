import type { UpsellConfig } from '../../types';
import { Label } from '@/components/ui/label';

interface UpsellFormProps {
    config: Partial<UpsellConfig>;
    onChange: (config: Partial<UpsellConfig>) => void;
}

// Reuse mock products
const AVAILABLE_PRODUCTS = [
    { id: 'prod_1', name: 'React Masterclass' },
    { id: 'prod_2', name: 'Advanced TypeScript' },
    { id: 'prod_3', name: 'Node.js Backend Guide' },
    { id: 'prod_4', name: 'UI/UX Design Systems' },
];

export const UpsellForm = ({ config, onChange }: UpsellFormProps) => {

    const handleProductToggle = (productId: string) => {
        const currentIds = config.upsell_product_ids || [];
        const newIds = currentIds.includes(productId)
            ? currentIds.filter(id => id !== productId)
            : [...currentIds, productId];

        onChange({ ...config, upsell_product_ids: newIds });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-slate-700">Upsell Products (Order Bumps)</Label>
                <div className="text-slate-400 text-xs" title="Offer these products at checkout">ⓘ</div>
            </div>

            <div className="grid grid-cols-1 gap-2 border rounded-md p-3 max-h-48 overflow-y-auto">
                {AVAILABLE_PRODUCTS.map(product => (
                    <div key={product.id} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded cursor-pointer" onClick={() => handleProductToggle(product.id)}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${config.upsell_product_ids?.includes(product.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                            {config.upsell_product_ids?.includes(product.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-sm text-slate-700">{product.name}</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500">Selected products will be shown as "Order Bumps" at checkout.</p>
        </div>
    );
};
