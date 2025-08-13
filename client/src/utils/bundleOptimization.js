/**
 * Bundle optimization utilities for better performance
 */

// Preload critical resources
export const preloadCriticalResources = () => {
  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap';
  fontLink.as = 'style';
  fontLink.onload = function() { this.rel = 'stylesheet'; };
  document.head.appendChild(fontLink);

  // Preload critical images
  const criticalImages = [
    '/placeholder-drone.jpg',
    // Add other critical images here
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

// Lazy load non-critical resources
export const lazyLoadNonCritical = () => {
  // Lazy load analytics or other non-critical scripts
  const loadScript = (src, async = true, defer = true) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    document.body.appendChild(script);
  };

  // Example: Load analytics after page load
  window.addEventListener('load', () => {
    // Add non-critical scripts here
    console.log('Non-critical resources loaded');
  });
};

// Optimize images for different screen sizes
export const getOptimizedImageUrl = (originalUrl, width, quality = 80) => {
  if (!originalUrl) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMGZmODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRyb25lIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
  
  // If using a CDN like Cloudinary, you can add transformations
  // For now, return original URL
  return originalUrl;
};

// Debounce function for performance optimization
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memory optimization - cleanup function
export const cleanupResources = () => {
  // Clear any intervals or timeouts
  // Remove event listeners
  // Clear caches if needed
  console.log('Resources cleaned up');
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export default {
  preloadCriticalResources,
  lazyLoadNonCritical,
  getOptimizedImageUrl,
  debounce,
  throttle,
  cleanupResources,
  measurePerformance,
  createIntersectionObserver,
  registerServiceWorker,
};