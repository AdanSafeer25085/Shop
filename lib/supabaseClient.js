import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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
