export type PricingType = 'one_time' | 'subscription' | 'split' | 'tiered' | 'donation' | 'bundle';
export type RecurringInterval = 'month' | 'year' | 'week' | 'day';


export interface OneTimeConfig {
    price: number;
    original_price?: number;
    currency: string;
}

export interface SubscriptionConfig {
    price: number;
    original_price?: number;
    setup_fee?: number;
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

export interface BundleConfig {
    price: number;
    original_price?: number;
    included_product_ids: string[];
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
    id?: string;
    product_id: string; // The main product this plan is for
    name: string;
    description: string;
    type: PricingType;
    is_active: boolean;
    values: string[]; // features/benefits
    allow_coupons?: boolean;

    // Polymorphic Configs
    one_time_config?: OneTimeConfig;
    subscription_config?: SubscriptionConfig;
    split_config?: SplitConfig;
    tiered_config?: TieredConfig;
    donation_config?: DonationConfig;
    bundle_config?: BundleConfig;
    upsell_config?: UpsellConfig;

    // Constraints
    limited_sell?: { max_quantity: number, sold_count: number };
    early_bird?: { discount_amount: number, deadline: string };
    access_duration?: { duration_days: number };

    created_at: string;
}

export interface UpsellConfig {
    upsell_product_ids: string[];
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
