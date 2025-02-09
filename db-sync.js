import { supabase } from './supabase-config.js';

// Function to sync data with Supabase
export async function syncWithSupabase(data, table) {
    try {
        // Upload data to Supabase
        const { data: result, error } = await supabase
            .from(table)
            .upsert(data, { onConflict: 'studentNumber' });

        if (error) throw error;
        return result;
    } catch (error) {
        console.error('Error syncing with Supabase:', error);
        throw error;
    }
}

// Function to fetch data from Supabase
export async function fetchFromSupabase(table) {
    try {
        const { data, error } = await supabase
            .from(table)
            .select('*');

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching from Supabase:', error);
        throw error;
    }
}

// Function to initialize real-time subscription
export function initializeRealtime(table, onUpdate) {
    const subscription = supabase
        .from(table)
        .on('*', payload => {
            console.log('Change received!', payload);
            onUpdate(payload);
        })
        .subscribe();

    return subscription;
}
