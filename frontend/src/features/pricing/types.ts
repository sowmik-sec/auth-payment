export type PricingType = 'one_time' | 'subscription' | 'split' | 'tiered' | 'donation';
export type RecurringInterval = 'month' | 'year' | 'week' | 'day';


export interface OneTimeConfig {
    price: number;
    original_price?: number;
    currency: string;
}

export interface SubscriptionConfig {
    price: number;
    original_price?: number;
    currency: string;
    interval: RecurringInterval;
    trial_days?: number;
}

export interface SplitConfig {
    total_amount: number;
    original_price?: number;
    currency: string;
    installment_count: number;
    interval: RecurringInterval;
    upfront_payment?: number;
}

export interface TierItem {
    name: string;
    min_qty: number;
    max_qty: number; // -1 for unlimited
    unit_price: number;
}

export interface TieredConfig {
    tiers: TierItem[];
}

export interface DonationConfig {
    min_amount: number;
    suggested_amount?: number;
    currency: string;
}

// Constraints
export interface LimitedSellConfig {
    max_quantity: number;
    sold_count: number;
}

export interface EarlyBirdConfig {
    discount_amount: number;
    deadline: string; // ISO Date
}

export interface AccessConfig {
    duration_days: number;
}

export interface PricingPlan {
    id: string;
    product_id: string; // Membership ID
    name: string;
    description: string;
    type: PricingType;
    values: string[]; // Benefits list
    allow_coupons?: boolean;

    // Polymorphic Configs
    one_time_config?: OneTimeConfig;
    subscription_config?: SubscriptionConfig;
    split_config?: SplitConfig;
    tiered_config?: TieredConfig;
    donation_config?: DonationConfig;

    // Constraints
    limited_sell?: LimitedSellConfig;
    early_bird?: EarlyBirdConfig;
    access_duration?: AccessConfig; // null = lifetime

    is_active: boolean;
    created_at: string;
}

export interface Membership {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
    plan_ids: string[];
    plans?: PricingPlan[]; // Populated
    created_at: string;
}
