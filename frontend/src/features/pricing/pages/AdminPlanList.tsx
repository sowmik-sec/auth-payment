
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '../api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { EditPlanModal } from '../components/EditPlanModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { PricingPlan } from '../types';

export const AdminPlanList = () => {
    const queryClient = useQueryClient();

    const MOCK_PRODUCTS = {
        '650000000000000000000001': 'Web Development Masterclass',
        '650000000000000000000002': 'React Pro Course',
        '650000000000000000000003': 'Premium Membership',
    };

    // Modal State
    const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const [planToDelete, setPlanToDelete] = useState<string | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const { data: plans, isLoading } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: () => pricingApi.getPlans(),
    });

    const deleteMutation = useMutation({
        mutationFn: pricingApi.deletePlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
            setIsDeleteOpen(false);
            setPlanToDelete(null);
        },
    });

    const handleEdit = (plan: PricingPlan) => {
        setEditingPlan(plan);
        setIsEditOpen(true);
    };

    const confirmDelete = (id: string) => {
        setPlanToDelete(id);
        setIsDeleteOpen(true);
    };

    const handleDelete = () => {
        if (planToDelete) {
            deleteMutation.mutate(planToDelete);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Prices (Admin)</h1>
                <Link to="/admin/pricing">
                    <Button><Plus className="w-4 h-4 mr-2" /> Create Price</Button>
                </Link>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans?.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {MOCK_PRODUCTS[plan.product_id as keyof typeof MOCK_PRODUCTS] || (
                                        <span className="font-mono text-xs">{plan.product_id || 'N/A'}</span>
                                    )}
                                </TableCell>
                                <TableCell className="capitalize">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                        {plan.type.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>{formatPrice(plan)}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    {plan.id && (
                                        <>
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(plan)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => confirmDelete(plan.id!)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <EditPlanModal
                plan={editingPlan}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the price and archive the corresponding product in Stripe.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

function formatPrice(plan: PricingPlan): string {
    const currency = plan.one_time_config?.currency || plan.subscription_config?.currency || 'USD';
    const symbol = currency === 'USD' ? '$' : currency;

    if (plan.type === 'one_time') {
        return `${symbol}${plan.one_time_config?.price}`;
    }
    if (plan.type === 'subscription') {
        return `${symbol}${plan.subscription_config?.price} / ${plan.subscription_config?.interval}`;
    }
    if (plan.type === 'tiered') {
        const minFn = (tiers: any[]) => Math.min(...tiers.map(t => t.unit_price));
        return plan.tiered_config?.tiers?.length ? `From ${symbol}${minFn(plan.tiered_config.tiers)}` : 'Tiered';
    }
    if (plan.type === 'donation') {
        return `Min ${symbol}${plan.donation_config?.min_amount}`;
    }
    if (plan.type === 'bundle') {
        return `${symbol}${plan.bundle_config?.price}`;
    }
    return 'Custom';
}

