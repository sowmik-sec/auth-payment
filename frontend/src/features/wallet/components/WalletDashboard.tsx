import { useState } from 'react';
import { useWallet, useTransactions, useRequestPayout } from '../hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, ArrowDownLeft, DollarSign, Wallet as WalletIcon } from 'lucide-react';

export const WalletDashboard = () => {
    const { data: wallet, isLoading: isWalletLoading } = useWallet();
    const { data: transactions, isLoading: isTxLoading } = useTransactions();
    const payoutMutation = useRequestPayout();

    const [payoutAmount, setPayoutAmount] = useState<string>("");

    const handlePayout = () => {
        if (!payoutAmount) return;
        payoutMutation.mutate({ amount: Number(payoutAmount), method: 'stripe' });
        setPayoutAmount("");
    };

    if (isWalletLoading || isTxLoading) {
        return <div className="p-8 text-center">Loading wallet...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">Wallet</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Card className="bg-slate-900 text-white border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold flex items-center gap-1">
                            <span>$</span>
                            {wallet?.balance.toFixed(2) ?? "0.00"}
                        </div>
                    </CardContent>
                </Card>

                {/* Payout Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request Payout</CardTitle>
                        <CardDescription>Withdraw funds to your connected account</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="pl-7"
                                    value={payoutAmount}
                                    onChange={(e) => setPayoutAmount(e.target.value)}
                                />
                            </div>
                            <Button onClick={handlePayout} disabled={payoutMutation.isPending}>
                                {payoutMutation.isPending ? 'Processing...' : 'Withdraw'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {transactions?.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">No transactions yet</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transactions?.map((tx: any) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {tx.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 capitalize">{tx.type} - {tx.description}</p>
                                            <p className="text-sm text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)} USD
                                        </div>
                                        <Button variant="ghost" size="sm" className="hidden group-hover:flex" onClick={() => window.open(`http://localhost:8080/invoices/mock_id/download`, '_blank')}>
                                            File
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
