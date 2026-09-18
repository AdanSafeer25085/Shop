import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Ensure URL is a valid URL to prevent build-time crashes if env vars are unset
const isValidUrl = (url) => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : "https://placeholder-project.supabase.co";
const supabaseAnonKey = rawKey && rawKey.trim().length > 0 ? rawKey : "placeholder-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;

export const incrementPurchaseCount = async (productId) => {
  const { data, error } = await supabase
    .rpc('increment_purchase_count', { product_id: productId });
  
  if (error) {
    console.error('Error incrementing purchase count:', error);
    throw error;
  }
  
  return data;
};

export const decrementPurchaseCount = async (productId) => {
  const { data, error } = await supabase
    .rpc('decrement_purchase_count', { product_id: productId });
  
  if (error) {
    console.error('Error decrementing purchase count:', error);
    throw error;
  }
  
  return data;
};
