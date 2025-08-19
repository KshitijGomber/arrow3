import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  Fade,
  Grow,
} from '@mui/material';
import {
  Videocam,
  Speed,
  Psychology,
  PanTool,
} from '@mui/icons-material';

const FeatureHighlights = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <Videocam sx={{ fontSize: 48 }} />,
      title: '4K Camera',
      description: 'Ultra-high definition recording with professional-grade image stabilization for crystal-clear footage.',
      specs: ['4K Ultra HD', '60fps Recording', '3-Axis Gimbal', 'HDR Support'],
      delay: 200,
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: 'Max Speed',
      description: 'Experience thrilling flight speeds up to 60+ km/h with precision control and safety features.',
      specs: ['60+ km/h Top Speed', 'Sport Mode', 'Wind Resistance', 'GPS Tracking'],
      delay: 400,
    },
    {
      icon: <Psychology sx={{ fontSize: 48 }} />,
      title: 'AI Auto-Stabilization',
      description: 'Advanced AI algorithms ensure smooth, stable flight even in challenging weather conditions.',
      specs: ['Smart Algorithms', 'Auto Hover', 'Obstacle Detection', 'Return-to-Home'],
      delay: 600,
    },
    {
      icon: <PanTool sx={{ fontSize: 48 }} />,
      title: 'Gesture Control',
      description: 'Intuitive hand gesture controls for effortless drone operation and creative photography.',
      specs: ['Hand Gestures', 'Voice Commands', 'Follow Me Mode', 'Quick Shots'],
      delay: 800,
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(180deg, 
              rgba(10, 10, 10, 1) 0%, 
              rgba(26, 26, 26, 1) 50%, 
              rgba(10, 10, 10, 1) 100%
            )`
          : `linear-gradient(180deg, 
              rgba(250, 250, 250, 1) 0%, 
              rgba(255, 255, 255, 1) 50%, 
              rgba(250, 250, 250, 1) 100%
            )`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(46, 164, 165, 0.05) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(46, 164, 165, 0.05) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(135deg, 
                  ${theme.palette.text.primary} 0%, 
                  ${theme.palette.primary.main} 50%, 
                  ${theme.palette.text.primary} 100%
                )`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Advanced Features
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              Cutting-edge technology meets intuitive design in every Arrow3 drone
            </Typography>
          </Box>
        </Fade>

        {/* Feature Cards Grid */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Grow in timeout={1000 + feature.delay}>
                <Card
                  sx={{
                    height: '100%',
                    background: theme.palette.mode === 'dark'
                      ? `linear-gradient(135deg, 
                          rgba(26, 26, 26, 0.8) 0%, 
                          rgba(42, 42, 42, 0.6) 100%
                        )`
                      : `linear-gradient(135deg, 
                          rgba(255, 255, 255, 0.8) 0%, 
                          rgba(248, 249, 250, 0.6) 100%
                        )`,
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px rgba(46, 164, 165, 0.2)`,
                      '& .feature-icon': {
                        color: 'primary.main',
                        transform: 'scale(1.1)',
                      },
                      '& .feature-glow': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {/* Hover glow effect */}
                  <Box
                    className="feature-glow"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: `linear-gradient(90deg, 
                        transparent 0%, 
                        ${theme.palette.primary.main} 50%, 
                        transparent 100%
                      )`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  />

                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Icon */}
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                      }}
                    >
                      <Box
                        className="feature-icon"
                        sx={{
                          color: 'text.secondary',
                          transition: 'all 0.3s ease',
                          p: 2,
                          borderRadius: '50%',
                          background: `radial-gradient(circle, 
                            rgba(46, 164, 165, 0.1) 0%, 
                            transparent 70%
                          )`,
                        }}
                      >
                        {feature.icon}
                      </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h5"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        textAlign: 'center',
                        color: 'text.primary',
                      }}
                    >
                      {feature.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        textAlign: 'center',
                        mb: 3,
                        lineHeight: 1.6,
                        flexGrow: 1,
                      }}
                    >
                      {feature.description}
                    </Typography>

                    {/* Specs */}
                    <Box sx={{ mt: 'auto' }}>
                      {feature.specs.map((spec, specIndex) => (
                        <Box
                          key={specIndex}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            '&:last-child': { mb: 0 },
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                              mr: 2,
                              boxShadow: `0 0 8px ${theme.palette.primary.main}`,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                            }}
                          >
                            {spec}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>

        {/* Bottom CTA Section */}
        <Fade in timeout={2000}>
          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, 
                rgba(46, 164, 165, 0.05) 0%, 
                rgba(46, 164, 165, 0.02) 100%
              )`,
              border: '1px solid',
              borderColor: 'rgba(46, 164, 165, 0.2)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                mb: 2,
                color: 'text.primary',
              }}
            >
              Ready to Experience the Future?
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 3,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Join thousands of pilots who have already taken flight with Arrow3 Aerospace technology.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              {['Professional Grade', 'Easy to Fly', '24/7 Support', 'Global Shipping'].map((badge, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    backgroundColor: 'rgba(46, 164, 165, 0.1)',
                    border: '1px solid',
                    borderColor: 'rgba(46, 164, 165, 0.3)',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 500,
                    }}
                  >
                    {badge}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default FeatureHighlights;