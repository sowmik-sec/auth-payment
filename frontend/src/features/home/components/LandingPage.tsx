import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Users, CreditCard, LayoutDashboard } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-65px)]">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white text-center px-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                    The Complete Payment Ecosystem
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400 mb-8">
                    Monetize, Manage, and Scale your digital business with our integrated Pricing, Wallet, and Affiliate solutions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/pricing">
                        <Button size="lg" className="px-8">View Pricing</Button>
                    </Link>
                    <Link to="/admin/pricing">
                        <Button variant="outline" size="lg">Admin Dashboard</Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-12 bg-white container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link to="/wallet">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <Wallet className="w-10 h-10 mb-2 text-blue-600" />
                                <CardTitle>Digital Wallet</CardTitle>
                                <CardDescription>Manage your balance, payouts, and transaction history.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>Real-time Balance</li>
                                    <li>Transaction Logs</li>
                                    <li>Instant Payouts</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/affiliate">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <Users className="w-10 h-10 mb-2 text-green-600" />
                                <CardTitle>Affiliate Portal</CardTitle>
                                <CardDescription>Earn commissions by referring new users.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>Unique Referral Links</li>
                                    <li>Click Tracking</li>
                                    <li>Performance Stats</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link to="/admin/pricing">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                                <CreditCard className="w-10 h-10 mb-2 text-purple-600" />
                                <CardTitle>Pricing Manager</CardTitle>
                                <CardDescription>Create and manage dynamic pricing plans.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    <li>One-Time & Subscriptions</li>
                                    <li>Tiered Pricing</li>
                                    <li>Plan Configuration</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>
        </div>
    );
}
