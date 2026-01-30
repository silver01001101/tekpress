import { supabase } from './supabase.js';

// Initialize supabase session on extension load
supabase.init();

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(request, sender) {
  switch (request.action) {
    case 'getSession':
      await supabase.init();
      return {
        isAuthenticated: supabase.isAuthenticated(),
        user: supabase.session ? await supabase.getUser() : null
      };

    case 'signIn':
      try {
        const result = await supabase.signIn(request.email, request.password);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }

    case 'signUp':
      try {
        const result = await supabase.signUp(request.email, request.password);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }

    case 'signInWithGoogle':
      try {
        const result = await supabase.signInWithOAuth('google');
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }

    case 'signOut':
      try {
        await supabase.signOut();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }

    case 'savePrintOrder':
      try {
        const orders = await supabase.from('print_orders');
        const result = await orders.insert({
          user_id: request.userId,
          image_url: request.imageUrl,
          product_type: request.productType,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }

    case 'getPrintOrders':
      try {
        const orders = await supabase.from('print_orders');
        const result = await orders.select('*');
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error: error.message };
      }

    default:
      return { success: false, error: 'Unknown action' };
  }
}

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Tekpress extension installed');
  }
});
