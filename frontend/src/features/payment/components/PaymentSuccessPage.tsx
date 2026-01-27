import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export const PaymentSuccessPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-green-200">
                <CardHeader className="text-center pb-6">
                    <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <CardTitle className="text-2xl font-bold text-slate-900">Payment Successful!</CardTitle>
                    <CardDescription>Thank you for your purchase.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center text-sm">
                        Your transaction has been completed successfully. You should receive a confirmation email shortly.
                    </div>

                    <div className="flex gap-2 mt-4">
                        <Link to="/" className="w-full">
                            <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                Return Home
                            </Button>
                        </Link>
                        <Link to="/wallet" className="w-full">
                            <Button variant="outline" className="w-full">
                                Go to Wallet
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
