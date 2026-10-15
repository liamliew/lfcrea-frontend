/**
 * Supabase types for the services catalogue tables.
 *
 * The repo has no generated types file yet, so this covers only the three
 * tables added by 20260910042000_create_services_catalogue.sql. Regenerate a
 * full schema with `supabase gen types typescript` when the rest is needed.
 */

export type Audience = 'business' | 'consumer';

export interface ServiceRow {
    id: string;
    slug: string;
    name: string;
    service_type: string;
    audience: Audience;
    short_description: string;
    long_description: string | null;
    hero_image_key: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ServicePricingRow {
    id: string;
    service_id: string;
    package_name: string;
    includes: string | null;
    price_from: number | null;
    currency: string;
    unit: string | null;
    sort_order: number;
}

export interface ServiceGalleryRow {
    id: string;
    service_id: string;
    image_key: string;
    caption: string | null;
    sort_order: number;
}

/** A service joined with its pricing and gallery rows. */
export interface ServiceDetail extends ServiceRow {
    service_pricing: ServicePricingRow[];
    service_gallery: ServiceGalleryRow[];
}

export interface Database {
    public: {
        Tables: {
            services: {
                Row: ServiceRow;
                Insert: Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'> &
                    Partial<Pick<ServiceRow, 'id' | 'created_at' | 'updated_at'>>;
                Update: Partial<ServiceRow>;
            };
            service_pricing: {
                Row: ServicePricingRow;
                Insert: Omit<ServicePricingRow, 'id'> & Partial<Pick<ServicePricingRow, 'id'>>;
                Update: Partial<ServicePricingRow>;
            };
            service_gallery: {
                Row: ServiceGalleryRow;
                Insert: Omit<ServiceGalleryRow, 'id'> & Partial<Pick<ServiceGalleryRow, 'id'>>;
                Update: Partial<ServiceGalleryRow>;
            };
        };
    };
}
