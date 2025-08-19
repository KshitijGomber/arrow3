import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { FlightTakeoff, PlayArrow } from '@mui/icons-material';

const HeroSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, 
              rgba(10, 10, 10, 0.9) 0%, 
              rgba(26, 26, 26, 0.8) 50%, 
              rgba(10, 10, 10, 0.9) 100%
            ), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%232ea4a5" stop-opacity="0.1"/><stop offset="100%" stop-color="%232ea4a5" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>')`
          : `linear-gradient(135deg, 
              rgba(250, 250, 250, 0.9) 0%, 
              rgba(255, 255, 255, 0.8) 50%, 
              rgba(250, 250, 250, 0.9) 100%
            ), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%232ea4a5" stop-opacity="0.1"/><stop offset="100%" stop-color="%232ea4a5" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 80%, rgba(46, 164, 165, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(46, 164, 165, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(46, 164, 165, 0.05) 0%, transparent 50%)`,
          animation: 'pulse 4s ease-in-out infinite alternate',
          '@keyframes pulse': {
            '0%': { opacity: 0.5 },
            '100%': { opacity: 1 },
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Box>
                <Slide direction="right" in timeout={1200}>
                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                      fontWeight: 700,
                      lineHeight: 1.1,
                      mb: 2,
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.main} 0%, 
                        ${theme.palette.primary.light} 50%, 
                        ${theme.palette.text.primary} 100%
                      )`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 30px rgba(46, 164, 165, 0.3)',
                    }}
                  >
                    Take Flight with
                    <br />
                    Arrow3 Aerospace
                  </Typography>
                </Slide>

                <Slide direction="right" in timeout={1400}>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                      fontWeight: 400,
                      mb: 4,
                      color: 'text.secondary',
                      lineHeight: 1.4,
                      maxWidth: 600,
                    }}
                  >
                    Experience the future of aerial innovation with our cutting-edge drones. 
                    Professional-grade technology meets intuitive design for the ultimate flight experience.
                  </Typography>
                </Slide>

                <Slide direction="right" in timeout={1600}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      mb: 4,
                    }}
                  >
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<FlightTakeoff />}
                      onClick={() => navigate('/drones')}
                      sx={{
                        px: 3,
                        py: 1,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        minHeight: 'auto',
                        background: `linear-gradient(135deg, 
                          ${theme.palette.primary.main} 0%, 
                          ${theme.palette.primary.dark} 100%
                        )`,
                        boxShadow: `0 8px 32px rgba(46, 164, 165, 0.3)`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 40px rgba(46, 164, 165, 0.4)`,
                          background: `linear-gradient(135deg, 
                            ${theme.palette.primary.light} 0%, 
                            ${theme.palette.primary.main} 100%
                          )`,
                        },
                      }}
                    >
                      Take Flight Now
                    </Button>

                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate('/drones')}
                      sx={{
                        px: 3,
                        py: 1,
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        minHeight: 'auto',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        borderWidth: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          backgroundColor: 'rgba(46, 164, 165, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 24px rgba(46, 164, 165, 0.2)`,
                        },
                      }}
                    >
                      Show Me the Drone in Action
                    </Button>
                  </Box>
                </Slide>

                <Slide direction="right" in timeout={1800}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        4K Ultra HD Camera
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        AI Auto-Stabilization
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        60+ km/h Max Speed
                      </Typography>
                    </Box>
                  </Box>
                </Slide>
              </Box>
            </Fade>
          </Grid>

          <Grid item xs={12} md={6}>
            <Fade in timeout={1500}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 300, md: 500 },
                }}
              >
                {/* Drone placeholder with animated elements */}
                <Box
                  sx={{
                    width: { xs: 250, md: 400 },
                    height: { xs: 250, md: 400 },
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Outer glow ring */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      borderRadius: '50%',
                      opacity: 0.3,
                      animation: 'rotate 20s linear infinite',
                      '@keyframes rotate': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }}
                  />
                  
                  {/* Middle ring */}
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '80%',
                      height: '80%',
                      border: '1px solid',
                      borderColor: 'primary.main',
                      borderRadius: '50%',
                      opacity: 0.5,
                      animation: 'rotate 15s linear infinite reverse',
                    }}
                  />

                  {/* Inner drone representation - replaced with plane image */}
                  <Box
                    sx={{
                      width: '60%',
                      height: '60%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                    }}
                  >
                    <img
                      src="/plane.png"
                      alt="Arrow3 Aerospace Drone"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: `drop-shadow(0 0 20px ${theme.palette.primary.main})`,
                        animation: 'pulse 2s ease-in-out infinite alternate',
                      }}
                    />
                  </Box>

                  {/* Floating particles */}
                  {[...Array(6)].map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'absolute',
                        width: 4,
                        height: 4,
                        backgroundColor: 'primary.main',
                        borderRadius: '50%',
                        opacity: 0.6,
                        animation: `float${index} ${3 + index}s ease-in-out infinite alternate`,
                        top: `${20 + index * 10}%`,
                        left: `${15 + index * 12}%`,
                        [`@keyframes float${index}`]: {
                          '0%': { 
                            transform: 'translateY(0px) translateX(0px)',
                            opacity: 0.3,
                          },
                          '100%': { 
                            transform: `translateY(${-20 - index * 5}px) translateX(${10 - index * 2}px)`,
                            opacity: 0.8,
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;