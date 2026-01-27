
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi } from '../api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export const AdminPlanList = () => {
    const queryClient = useQueryClient();
    // const navigate = useNavigate();

    const { data: plans, isLoading } = useQuery({
        queryKey: ['admin-plans'],
        queryFn: () => pricingApi.getPlans(),
    });

    const deleteMutation = useMutation({
        mutationFn: pricingApi.deletePlan,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
        },
    });

    const handleEdit = (planId: string) => {
        // Navigate to edit page (we need to create this route/logic)
        // For now, assume a route like /admin/pricing/:id or similar
        // navigate({ to: `/admin/pricing/${planId}` });
        alert("Edit flow to be implemented fully via generic form");
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
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(plan.id!)}>
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => {
                                                    if (confirm('Are you sure? This will archive the Stripe Product.')) {
                                                        deleteMutation.mutate(plan.id!);
                                                    }
                                                }}
                                                disabled={deleteMutation.isPending}
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
        </div>
    );
};
