import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CouponForm = ({ open, onOpenChange }: Props) => {
    const queryClient = useQueryClient();
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('percent');
    const [amount, setAmount] = useState<number>(0);
    const [maxUses, setMaxUses] = useState<number>(0); // 0 = unlimited
    const [expiry, setExpiry] = useState<string>('');

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('http://localhost:8080/coupons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create coupon');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            onOpenChange(false);
            // Reset form
            setCode('');
            setAmount(0);
        }
    });

    const handleSubmit = () => {
        const payload: any = {
            code,
            discount_type: discountType,
            discount_amount: amount,
            max_uses: maxUses,
            is_active: true
        };
        if (expiry) {
            payload.expiry_date = new Date(expiry).toISOString();
        }
        createMutation.mutate(payload);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Coupon</DialogTitle>
                    <DialogDescription>
                        Create a new discount code for your customers.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. SUMMER20"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Type</Label>
                            <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percent">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Value</Label>
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="20"
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Max Uses (Optional)</Label>
                        <Input
                            type="number"
                            value={maxUses}
                            onChange={(e) => setMaxUses(Number(e.target.value))}
                            placeholder="0 for unlimited"
                        />
                        <p className="text-[10px] text-slate-500">Leave 0 for unlimited uses.</p>
                    </div>
                    <div className="grid gap-2">
                        <Label>Expiry Date (Optional)</Label>
                        <Input
                            type="date"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Create Coupon'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
