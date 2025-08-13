import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Rating,
  useTheme,
  Fade,
} from '@mui/material';
import {
  Verified,
  Security,
  LocalShipping,
  Support,
  PlayArrow,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TestimonialsSection = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Professional Photographer',
      avatar: 'SC',
      rating: 5,
      text: 'The Arrow3 drone has revolutionized my aerial photography business. The 4K camera quality is exceptional, and the AI stabilization ensures every shot is perfect.',
      location: 'San Francisco, CA',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Film Director',
      avatar: 'MR',
      rating: 5,
      text: 'Incredible flight performance and intuitive controls. The gesture control feature has made capturing dynamic shots so much easier for our film productions.',
      location: 'Los Angeles, CA',
    },
    {
      name: 'Emily Watson',
      role: 'Travel Blogger',
      avatar: 'EW',
      rating: 5,
      text: 'Perfect for travel content creation. Lightweight, powerful, and the battery life is outstanding. The automated flight modes have taken my content to the next level.',
      location: 'New York, NY',
    },
    {
      name: 'David Kim',
      role: 'Real Estate Agent',
      avatar: 'DK',
      rating: 5,
      text: 'Game-changer for property listings. The professional-grade footage and easy operation have significantly improved my marketing materials and client satisfaction.',
      location: 'Seattle, WA',
    },
  ];

  const trustIndicators = [
    {
      icon: <Verified sx={{ fontSize: 32 }} />,
      title: 'Certified Quality',
      description: 'FAA approved and CE certified for professional use',
    },
    {
      icon: <Security sx={{ fontSize: 32 }} />,
      title: '2-Year Warranty',
      description: 'Comprehensive coverage with free repairs and replacements',
    },
    {
      icon: <LocalShipping sx={{ fontSize: 32 }} />,
      title: 'Free Shipping',
      description: 'Fast, secure delivery worldwide with tracking',
    },
    {
      icon: <Support sx={{ fontSize: 32 }} />,
      title: '24/7 Support',
      description: 'Expert technical support whenever you need it',
    },
  ];

  const stats = [
    { number: '50,000+', label: 'Happy Pilots' },
    { number: '98%', label: 'Satisfaction Rate' },
    { number: '150+', label: 'Countries Served' },
    { number: '4.9/5', label: 'Average Rating' },
  ];

  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, 
          rgba(10, 10, 10, 1) 0%, 
          rgba(18, 18, 18, 1) 50%, 
          rgba(10, 10, 10, 1) 100%
        )`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(46, 164, 165, 0.03) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(46, 164, 165, 0.03) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Stats Section */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 8 }}>
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 1,
                        fontSize: { xs: '1.8rem', md: '2.5rem' },
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Testimonials Section */}
        <Fade in timeout={1200}>
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 700,
                textAlign: 'center',
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
              What Our Pilots Say
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                textAlign: 'center',
                mb: 6,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Join thousands of satisfied customers who have taken their creativity to new heights
            </Typography>

            {/* Testimonials Grid - Show 3-4 at once */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Fade in timeout={1000 + index * 200}>
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, 
                          rgba(26, 26, 26, 0.8) 0%, 
                          rgba(42, 42, 42, 0.6) 100%
                        )`,
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        p: 2,
                        height: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(46, 164, 165, 0.2)',
                          transform: 'translateY(-4px)',
                          backgroundColor: 'rgba(46, 164, 165, 0.05)',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', flex: 1, p: '0 !important' }}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            mx: 'auto',
                            mb: 2,
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
                        >
                          {testimonial.avatar}
                        </Avatar>
                        
                        <Rating
                          value={testimonial.rating}
                          readOnly
                          size="small"
                          sx={{
                            mb: 2,
                            '& .MuiRating-iconFilled': {
                              color: 'primary.main',
                            },
                          }}
                        />
                        
                        <Typography
                          variant="body2"
                          sx={{
                            fontStyle: 'italic',
                            mb: 2,
                            color: 'text.primary',
                            lineHeight: 1.4,
                            fontSize: '0.875rem',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          "{testimonial.text}"
                        </Typography>
                        
                        <Box sx={{ mt: 'auto' }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 600,
                              color: 'primary.main',
                              mb: 0.5,
                              fontSize: '0.875rem',
                            }}
                          >
                            {testimonial.name}
                          </Typography>
                          
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              lineHeight: 1.2,
                            }}
                          >
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Trust Indicators */}
        <Fade in timeout={1400}>
          <Box sx={{ mb: 8 }}>
            <Grid container spacing={4}>
              {trustIndicators.map((indicator, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(46, 164, 165, 0.05)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 2,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {indicator.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {indicator.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        lineHeight: 1.5,
                      }}
                    >
                      {indicator.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* CTA Section */}
        <Fade in timeout={1600}>
          <Box
            sx={{
              textAlign: 'center',
              p: 6,
              borderRadius: 3,
              background: `linear-gradient(135deg, 
                rgba(46, 164, 165, 0.1) 0%, 
                rgba(46, 164, 165, 0.05) 100%
              )`,
              border: '1px solid',
              borderColor: 'rgba(46, 164, 165, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'text.primary',
                fontSize: { xs: '1.8rem', md: '2.5rem' },
              }}
            >
              Ready to Join Our Community?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              See why thousands of pilots choose Arrow3 for their aerial adventures
            </Typography>
            <Button
              variant="contained"
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
                background: `linear-gradient(135deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.primary.dark} 100%
                )`,
                boxShadow: `0 8px 32px rgba(46, 164, 165, 0.3)`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 12px 40px rgba(46, 164, 165, 0.4)`,
                },
              }}
            >
              Show Me the Drone in Action
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;