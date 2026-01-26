import { useState } from 'react';
import { useAffiliateStats, useCreateLink, useCreateProgram } from '../hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, TrendingUp, MousePointer, DollarSign } from 'lucide-react';

export const AffiliateDashboard = () => {
    const { data: stats, isLoading } = useAffiliateStats();
    const createLinkMutation = useCreateLink();
    const createProgramMutation = useCreateProgram();

    // We hardcode Program ID for now as "Global" isn't fully fetched dynamically yet
    const [programId, setProgramId] = useState("650000000000000000000010"); // Mock Program ID
    const [code, setCode] = useState("");

    const handleCreateLink = () => {
        if (!code) return;
        createLinkMutation.mutate({ programId, code });
        setCode("");
    };

    // Helper to init a program if none exists (for demo)
    const handleInitProgram = () => {
        createProgramMutation.mutate(15.0); // 15% commission
    }

    if (isLoading) return <div className="p-8">Loading Portal...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Affiliate Portal</h1>
                    <p className="text-slate-500">Manage your referrals and commissions</p>
                </div>
                <Button variant="outline" onClick={handleInitProgram}>Init Program (Dev)</Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500 font-medium">Total Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <MousePointer className="w-5 h-5 text-indigo-500" />
                            {stats?.links.reduce((acc, l) => acc + l.clicks, 0) || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500 font-medium">Conversions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" />
                            {stats?.links.reduce((acc, l) => acc + l.conversions, 0) || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500 font-medium">Pending Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-amber-500" />
                            $0.00 {/* Calculated from commissions later */}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Link Generator */}
            <Card className="border-indigo-100 bg-indigo-50">
                <CardHeader>
                    <CardTitle className="text-indigo-900">Generate New Link</CardTitle>
                    <CardDescription className="text-indigo-700">Create a unique code to track your referrals</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="code" className="text-indigo-900">Referral Code</Label>
                            <Input
                                type="text"
                                id="code"
                                placeholder="e.g. SUMMER2024"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="bg-white"
                            />
                        </div>
                        <Button onClick={handleCreateLink} disabled={createLinkMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700">
                            {createLinkMutation.isPending ? 'Generating...' : 'Create Link'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Active Links Table */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Referral Links</h2>
                <div className="border rounded-lg bg-white overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium text-slate-700">Code</th>
                                <th className="px-6 py-3 font-medium text-slate-700">URL</th>
                                <th className="px-6 py-3 font-medium text-slate-700">Clicks</th>
                                <th className="px-6 py-3 font-medium text-slate-700">Sales</th>
                                <th className="px-6 py-3 font-medium text-slate-700">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats?.links.map((link) => (
                                <tr key={link.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono font-medium text-indigo-600">{link.code}</td>
                                    <td className="px-6 py-4 text-slate-500 truncate max-w-xs flex items-center gap-2">
                                        {link.url}
                                        <Copy className="w-3 h-3 cursor-pointer hover:text-indigo-600" onClick={() => navigator.clipboard.writeText(link.url)} />
                                    </td>
                                    <td className="px-6 py-4">{link.clicks}</td>
                                    <td className="px-6 py-4">{link.conversions}</td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(link.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {stats?.links.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        No active links found. Generate one above!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
