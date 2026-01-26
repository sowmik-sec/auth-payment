import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface PricingTypeCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    isSelected?: boolean;
    onClick: () => void;
}

export const PricingTypeCard: React.FC<PricingTypeCardProps> = ({
    title,
    description,
    icon: Icon,
    isSelected,
    onClick,
}) => {
    return (
        <Card
            className={cn(
                'cursor-pointer transition-all duration-200 border-2 hover:border-blue-500/50',
                isSelected ? 'border-blue-600 bg-blue-50/50' : 'border-transparent hover:bg-slate-50'
            )}
            onClick={onClick}
        >
            <CardContent className="flex items-start gap-4 p-4">
                <div className={cn(
                    "p-2 rounded-lg",
                    isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
                )}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm text-slate-500 leading-snug">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
};
