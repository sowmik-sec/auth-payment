import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '../api';
import type { PricingPlan, RecurringInterval } from '../types';

interface EditPlanModalProps {
    plan: PricingPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditPlanModal = ({ plan, open, onOpenChange }: EditPlanModalProps) => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [interval, setInterval] = useState<RecurringInterval>('month');

    // Initialize state when plan opens
    useEffect(() => {
        if (plan) {
            setName(plan.name);
            setDescription(plan.description);

            // Extract price/interval logic
            if (plan.one_time_config) {
                setPrice(plan.one_time_config.price);
            } else if (plan.subscription_config) {
                setPrice(plan.subscription_config.price);
                setInterval(plan.subscription_config.interval);
            } else if (plan.bundle_config) {
                setPrice(plan.bundle_config.price);
            }
        }
    }, [plan, open]);

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            if (!plan?.id) return;
            return pricingApi.updatePlan(plan.id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            onOpenChange(false);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Prepare payload - only send what's relevant or allowed
        const payload: any = { name, description };

        // Simple heuristic: if it has price config, update it
        if (plan?.type === 'one_time' || plan?.type === 'subscription' || plan?.type === 'bundle') {
            payload.price = price;
        }
        if (plan?.type === 'subscription') {
            payload.interval = interval;
        }

        updateMutation.mutate(payload);
    };

    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Price</DialogTitle>
                    <DialogDescription>
                        Update the pricing details. {plan.stripe_price_id && "This will sync with Stripe."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    {(plan.type === 'one_time' || plan.type === 'subscription' || plan.type === 'bundle') && (
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price ({plan.one_time_config?.currency || plan.subscription_config?.currency || 'USD'})</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="any"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                            />
                        </div>
                    )}

                    {plan.type === 'subscription' && (
                        <div className="grid gap-2">
                            <Label htmlFor="interval">Interval</Label>
                            <select
                                id="interval"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={interval}
                                onChange={(e) => setInterval(e.target.value as RecurringInterval)}
                            >
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                                <option value="week">Week</option>
                                <option value="day">Day</option>
                            </select>
                        </div>
                    )}

                    {!(plan.type === 'one_time' || plan.type === 'subscription' || plan.type === 'bundle') && (
                        <div className="text-sm text-amber-500 bg-amber-50 p-2 rounded">
                            Price editing for complex types (Tiered/Donation/Split) is not supported in this quick edit view yet.
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
