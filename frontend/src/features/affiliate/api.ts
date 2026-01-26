import { api } from '@/lib/api';

export interface AffiliateLink {
    id: string;
    code: string;
    url: string;
    clicks: number;
    conversions: number;
    created_at: string;
}

export interface AffiliateStats {
    links: AffiliateLink[];
    commissions: any[]; // Define Commission type if needed detailed
}

export const affiliateApi = {
    createProgram: async (rate: number) => {
        const response = await api.post('/affiliate/programs', { rate });
        return response.data;
    },
    createLink: async (programId: string, code: string) => {
        const response = await api.post('/affiliate/links', { program_id: programId, code });
        return response.data;
    },
    getStats: async () => {
        const response = await api.get<AffiliateStats>('/affiliate/stats');
        return response.data;
    }
};
