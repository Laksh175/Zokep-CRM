// Robust utility to load Razorpay Checkout SDK script on-demand
let loadPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve(true);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    // Check if script already in DOM
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      if (window.Razorpay) return resolve(true);
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    // Timeout safety (10 seconds)
    const timer = setTimeout(() => {
      console.warn('[Razorpay] Script loading timed out.');
      resolve(false);
    }, 10000);

    script.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };

    script.onerror = () => {
      clearTimeout(timer);
      console.error('[Razorpay] Failed to load Checkout SDK script.');
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return loadPromise;
};

export default loadRazorpayScript;

