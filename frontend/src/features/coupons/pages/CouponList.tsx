import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Copy, Trash2, Edit } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CouponForm } from '../components/CouponForm';

interface Coupon {
    id: string;
    code: string;
    discount_type: 'fixed' | 'percent';
    discount_amount: number;
    max_uses: number;
    used_count: number;
    expiry_date?: string;
    is_active: boolean;
}

export const CouponList = () => {
    // Determine active tab or filter logic if needed
    const { data: coupons, isLoading } = useQuery({
        queryKey: ['coupons'],
        queryFn: async () => {
            const res = await fetch('http://localhost:8080/coupons', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (!res.ok) throw new Error('Failed to fetch coupons');
            return res.json() as Promise<Coupon[]>;
        }
    });

    const [isCreateOpen, setIsCreateOpen] = useState(false);

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
                    <p className="text-muted-foreground">Manage discounts and promo codes.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {coupons && coupons.length > 0 ? (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-slate-400" />
                                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{coupon.code}</span>
                                            <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400 hover:text-slate-600">
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {coupon.discount_type === 'percent' ? `${coupon.discount_amount}%` : `$${coupon.discount_amount}`}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium">{coupon.used_count}</span>
                                            <span className="text-slate-400">/ {coupon.max_uses === 0 ? '∞' : coupon.max_uses}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.is_active ? 'default' : 'secondary'} className={coupon.is_active ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                            {coupon.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Expiry'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No coupons found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <CouponForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div >
    );
};
