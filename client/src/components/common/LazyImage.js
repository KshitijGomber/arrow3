import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

const LazyImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  sx = {},
  skeletonProps = {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <Box
      ref={imgRef}
      sx={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
      {...props}
    >
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            ...skeletonProps.sx,
          }}
          {...skeletonProps}
        />
      )}
      
      {isInView && (
        <Box
          component="img"
          src={hasError ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMGZmODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRyb25lIEltYWdlPC90ZXh0Pgo8L3N2Zz4K' : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 1 : 0,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      )}
    </Box>
  );
};

export default LazyImage;