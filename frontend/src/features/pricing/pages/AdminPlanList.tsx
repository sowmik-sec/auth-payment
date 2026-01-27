
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
                <h1 className="text-2xl font-bold">Pricing Plans (Admin)</h1>
                <Link to="/admin/pricing">
                    <Button><Plus className="w-4 h-4 mr-2" /> Create Plan</Button>
                </Link>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Stripe Product ID</TableHead>
                            <TableHead>Stripe Price ID</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {plans?.map((plan) => (
                            <TableRow key={plan.id}>
                                <TableCell className="font-medium">{plan.name}</TableCell>
                                <TableCell className="capitalize">{plan.type}</TableCell>
                                <TableCell className="font-mono text-xs">{plan.stripe_product_id}</TableCell>
                                <TableCell className="font-mono text-xs">{plan.stripe_price_id}</TableCell>
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
                            This action cannot be undone. This will permanently delete the pricing plan and archive the corresponding product in Stripe.
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
