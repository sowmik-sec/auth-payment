import { Button } from '@/components/ui/button';
import { useConnectStripe, useStripeConnectStatus, useStripeDashboard } from '../hooks';
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const StripeConnectPage = () => {
    const { data, isLoading } = useStripeConnectStatus();
    const connectMutation = useConnectStripe();
    const dashboardMutation = useStripeDashboard();

    // Check for success/error params in URL (after redirect)
    // We can use TanStack router search params, or just window.location for simplicity if router setup varies.
    // Let's assume basic window.location parsing for now or use useSearchParams if we are sure about the route config.
    // To be safe and framework-agnostic here:
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            toast.success('Stripe account connected successfully!');
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname);
        }
        if (params.get('error')) {
            toast.error('Failed to connect: ' + params.get('error'));
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const isConnected = data?.connected;

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Stripe Connect</h1>
                <p className="text-slate-500 mt-2">
                    Connect your Stripe account to receive payouts directly.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-slate-100'}`}>
                            {isConnected ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-slate-500" />
                            )}
                        </div>
                        <div className="space-y-1 flex-1">
                            <h3 className="font-semibold text-lg text-slate-900">
                                {isConnected ? 'Payment Account Connected' : 'No Payment Account Connected'}
                            </h3>
                            <p className="text-slate-500">
                                {isConnected
                                    ? 'Your Stripe account is connected and ready to receive payouts.'
                                    : 'Connect with Stripe to start selling courses and products.'}
                            </p>

                            {isConnected && data?.stripe_connect_id && (
                                <p className="text-xs font-mono text-slate-400 pt-2">
                                    Account ID: {data.stripe_connect_id} • Status: {data.status}
                                </p>
                            )}
                        </div>

                        {isConnected ? (
                            <Button
                                variant="outline"
                                onClick={() => dashboardMutation.mutate()}
                                disabled={dashboardMutation.isPending}
                                className="gap-2"
                            >
                                {dashboardMutation.isPending ? 'Opening...' : 'View Dashboard'}
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={() => connectMutation.mutate()}
                                disabled={connectMutation.isPending}
                                className="bg-indigo-600 hover:bg-indigo-700 gap-2"
                            >
                                {connectMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        Connect with Stripe
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Info Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 text-sm text-slate-500 flex gap-2 items-center">
                    <div className="font-medium text-slate-700">Protected by Stripe</div>
                    <div>•</div>
                    <div>All payments and payouts are processed securely by Stripe.</div>
                </div>
            </div>
        </div>
    );
};
