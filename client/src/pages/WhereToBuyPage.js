import React from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
  Fade,
  Paper,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  LocalShipping,
  Security,
  Support,
  Verified,
  CreditCard,
  FlightTakeoff,
  CheckCircle,
  Store,
  Public,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const WhereToBuyPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const purchaseFeatures = [
    {
      icon: <Security sx={{ fontSize: 32 }} />,
      title: 'Secure Payment',
      description: 'Your transactions are protected with bank-level security',
    },
    {
      icon: <LocalShipping sx={{ fontSize: 32 }} />,
      title: 'Free Worldwide Shipping',
      description: 'Fast, insured delivery to over 150 countries with tracking',
    },
    {
      icon: <Verified sx={{ fontSize: 32 }} />,
      title: '2-Year Warranty',
      description: 'Comprehensive coverage with free repairs and replacements',
    },
    {
      icon: <Support sx={{ fontSize: 32 }} />,
      title: '24/7 Customer Support',
      description: 'Expert assistance whenever you need help',
    },
  ];

  const paymentMethods = [
    'Visa',
    'Mastercard',
    'American Express',
    'PayPal',
    'Apple Pay',
    'Google Pay',
  ];

  const benefits = [
    'Factory direct pricing - no middleman markup',
    'Latest models with cutting-edge technology',
    'Instant access to firmware updates',
    'Priority customer support',
    'Exclusive online-only promotions',
    '30-day money-back guarantee',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, 
          rgba(10, 10, 10, 1) 0%, 
          rgba(18, 18, 18, 1) 50%, 
          rgba(10, 10, 10, 1) 100%
        )`,
        pt: 10,
        pb: 8,
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
        {/* Hero Section */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
                color: 'primary.main',
              }}
            >
              <Store sx={{ fontSize: 60 }} />
            </Box>
            
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
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
              Where to Buy Arrow3 Drones
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              Get your Arrow3 drone directly from us with the best prices, warranty, and support. Shop online for the complete Arrow3 experience.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Public />}
                label="Worldwide Shipping"
                sx={{
                  backgroundColor: 'rgba(46, 164, 165, 0.1)',
                  color: 'primary.main',
                  border: '1px solid rgba(46, 164, 165, 0.3)',
                }}
              />
              <Chip
                icon={<Security />}
                label="Secure Checkout"
                sx={{
                  backgroundColor: 'rgba(46, 164, 165, 0.1)',
                  color: 'primary.main',
                  border: '1px solid rgba(46, 164, 165, 0.3)',
                }}
              />
              <Chip
                icon={<Verified />}
                label="Official Store"
                sx={{
                  backgroundColor: 'rgba(46, 164, 165, 0.1)',
                  color: 'primary.main',
                  border: '1px solid rgba(46, 164, 165, 0.3)',
                }}
              />
            </Box>
          </Box>
        </Fade>

        {/* Main Purchase Section */}
        <Fade in timeout={1000}>
          <Box
            sx={{
              mb: 8,
              p: 6,
              borderRadius: 4,
              background: `linear-gradient(135deg, 
                rgba(26, 26, 26, 0.8) 0%, 
                rgba(42, 42, 42, 0.6) 100%
              )`,
              border: '2px solid',
              borderColor: 'rgba(46, 164, 165, 0.3)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Glow effect */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at center, rgba(46, 164, 165, 0.1) 0%, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <ShoppingCart
                sx={{
                  fontSize: 50,
                  color: 'primary.main',
                  mb: 3,
                }}
              />
              
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                Buy Online Today
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  maxWidth: 500,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Purchase your Arrow3 drone directly from our official online store. Get the best prices, authentic products, and full warranty coverage.
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<FlightTakeoff />}
                onClick={() => navigate('/drones')}
                sx={{
                  px: 6,
                  py: 2.5,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, 
                    ${theme.palette.primary.main} 0%, 
                    ${theme.palette.primary.dark} 100%
                  )`,
                  boxShadow: `0 12px 40px rgba(46, 164, 165, 0.4)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 16px 50px rgba(46, 164, 165, 0.5)`,
                  },
                }}
              >
                Shop Arrow3 Drones Now
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Why Buy Online Benefits */}
        <Fade in timeout={1200}>
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                mb: 6,
                color: 'text.primary',
              }}
            >
              Why Buy from Our Online Store?
            </Typography>
            
            <Grid container spacing={2}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Fade in timeout={1400 + index * 100}>
                    <Paper
                      sx={{
                        p: 3,
                        background: `linear-gradient(135deg, 
                          rgba(26, 26, 26, 0.6) 0%, 
                          rgba(42, 42, 42, 0.4) 100%
                        )`,
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(46, 164, 165, 0.2)',
                          backgroundColor: 'rgba(46, 164, 165, 0.02)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle
                          sx={{
                            color: 'primary.main',
                            mr: 2,
                            fontSize: 24,
                          }}
                        />
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.primary',
                            fontWeight: 500,
                            lineHeight: 1.5,
                          }}
                        >
                          {benefit}
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Purchase Features */}
        <Fade in timeout={1400}>
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                mb: 6,
                color: 'text.primary',
              }}
            >
              What You Get When You Buy Online
            </Typography>
            
            <Grid container spacing={4}>
              {purchaseFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Fade in timeout={1600 + index * 200}>
                    <Card
                      sx={{
                        height: '100%',
                        background: `linear-gradient(135deg, 
                          rgba(26, 26, 26, 0.8) 0%, 
                          rgba(42, 42, 42, 0.6) 100%
                        )`,
                        border: '1px solid',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(46, 164, 165, 0.3)',
                          transform: 'translateY(-4px)',
                          backgroundColor: 'rgba(46, 164, 165, 0.05)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Box
                          sx={{
                            color: 'primary.main',
                            mb: 2,
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 2,
                            color: 'text.primary',
                          }}
                        >
                          {feature.title}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Payment Methods */}
        <Fade in timeout={1800}>
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                mb: 4,
                color: 'text.primary',
              }}
            >
              Accepted Payment Methods
            </Typography>
            
            <Paper
              sx={{
                p: 4,
                background: `linear-gradient(135deg, 
                  rgba(26, 26, 26, 0.6) 0%, 
                  rgba(42, 42, 42, 0.4) 100%
                )`,
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                textAlign: 'center',
              }}
            >
              <CreditCard
                sx={{
                  fontSize: 40,
                  color: 'primary.main',
                  mb: 3,
                }}
              />
              
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  mb: 3,
                }}
              >
                We accept all major payment methods for your convenience
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                {paymentMethods.map((method, index) => (
                  <Chip
                    key={index}
                    label={method}
                    sx={{
                      backgroundColor: 'rgba(46, 164, 165, 0.1)',
                      color: 'primary.main',
                      border: '1px solid rgba(46, 164, 165, 0.3)',
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>
        </Fade>

        {/* Final CTA */}
        <Fade in timeout={2000}>
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
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: 'text.primary',
              }}
            >
              Ready to Take Flight?
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              Join thousands of satisfied customers who have chosen Arrow3 for their aerial adventures. Shop now and experience the future of flight.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/drones')}
              sx={{
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
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
              Start Shopping Now
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default WhereToBuyPage;
