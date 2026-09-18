import { lazy } from 'react';

/**
 * Robust lazy loading wrapper that automatically recovers from
 * dynamic import / chunk loading failures after new deployments.
 */
export const lazyWithRetry = (componentImport, componentName = 'page') =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem(`retry_lazy_${componentName}`) || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem(`retry_lazy_${componentName}`, 'false');
      return component;
    } catch (error) {
      console.warn(`Dynamic import failed for ${componentName}. Recovering from deployment update...`, error);

      if (!pageHasAlreadyBeenForceRefreshed) {
        // Mark that we tried force refresh
        window.sessionStorage.setItem(`retry_lazy_${componentName}`, 'true');
        // Force reload without browser cache
        window.location.reload();
        return new Promise(() => {}); // Suspend until reload completes
      }

      // If already reloaded and still failed, throw to ErrorBoundary
      throw error;
    }
  });

export default lazyWithRetry;
