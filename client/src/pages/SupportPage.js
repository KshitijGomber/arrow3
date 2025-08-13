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
} from '@mui/material';
import {
  Email,
  Phone,
  Chat,
  Support as SupportIcon,
  LiveHelp,
  ContactSupport,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';

const SupportPage = () => {
  const theme = useTheme();

  const supportOptions = [
    {
      icon: <Email sx={{ fontSize: 40 }} />,
      title: 'Email Support',
      description: 'Get detailed help via email within 24 hours',
      contact: 'kshitijgomber@gmail.com',
      action: 'Send Email',
      actionLink: 'mailto:kshitijgomber@gmail.com',
      availability: '24/7 Response within 24 hours',
    },
    {
      icon: <LiveHelp sx={{ fontSize: 40 }} />,
      title: 'FAQ & Documentation',
      description: 'Find instant answers to common questions',
      contact: 'Self-service help center',
      action: 'Browse FAQ',
      actionLink: '#faq',
      availability: 'Available 24/7',
    },
    {
      icon: <ContactSupport sx={{ fontSize: 40 }} />,
      title: 'Technical Support',
      description: 'Expert assistance for technical issues',
      contact: 'kshitijgomber@gmail.com',
      action: 'Contact Now',
      actionLink: 'mailto:kshitijgomber@gmail.com?subject=Technical Support Request',
      availability: 'Mon-Fri 9 AM - 6 PM PST',
    },
  ];

  const faqItems = [
    {
      question: 'How long is the warranty on Arrow3 drones?',
      answer: 'All Arrow3 drones come with a comprehensive 2-year warranty covering manufacturing defects and normal wear and tear.',
    },
    {
      question: 'What is the flight time of Arrow3 drones?',
      answer: 'Our drones offer up to 30 minutes of flight time on a single charge, depending on weather conditions and usage.',
    },
    {
      question: 'Are Arrow3 drones FAA certified?',
      answer: 'Yes, all our drones are FAA approved and CE certified for both recreational and commercial use.',
    },
    {
      question: 'Do you offer international shipping?',
      answer: 'Yes, we ship to over 150 countries worldwide with fast, secure delivery and tracking.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and PayPal for secure online transactions.',
    },
    {
      question: 'Can I return my drone if I\'m not satisfied?',
      answer: 'Yes, we offer a 30-day money-back guarantee. Items must be in original condition with all accessories.',
    },
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
              <SupportIcon sx={{ fontSize: 60 }} />
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
              How Can We Help You?
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
              Our dedicated support team is here to ensure you have the best experience with your Arrow3 drone. Get the help you need, when you need it.
            </Typography>
          </Box>
        </Fade>

        {/* Support Options */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 10 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                mb: 6,
                color: 'text.primary',
              }}
            >
              Choose Your Support Option
            </Typography>
            
            <Grid container spacing={4}>
              {supportOptions.map((option, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Fade in timeout={1200 + index * 200}>
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
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Box
                          sx={{
                            color: 'primary.main',
                            mb: 3,
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          {option.icon}
                        </Box>
                        
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 600,
                            mb: 2,
                            color: 'text.primary',
                          }}
                        >
                          {option.title}
                        </Typography>
                        
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            mb: 3,
                            lineHeight: 1.6,
                          }}
                        >
                          {option.description}
                        </Typography>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            mb: 1,
                            fontWeight: 500,
                          }}
                        >
                          {option.contact}
                        </Typography>
                        
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            mb: 3,
                            display: 'block',
                          }}
                        >
                          <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                          {option.availability}
                        </Typography>
                        
                        <Button
                          variant="contained"
                          fullWidth
                          component="a"
                          href={option.actionLink}
                          sx={{
                            mt: 2,
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, 
                              ${theme.palette.primary.main} 0%, 
                              ${theme.palette.primary.dark} 100%
                            )`,
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: `0 8px 25px rgba(46, 164, 165, 0.3)`,
                            },
                          }}
                        >
                          {option.action}
                        </Button>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* FAQ Section */}
        <Fade in timeout={1400}>
          <Box id="faq">
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                mb: 6,
                color: 'text.primary',
              }}
            >
              Frequently Asked Questions
            </Typography>
            
            <Grid container spacing={3}>
              {faqItems.map((faq, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Fade in timeout={1600 + index * 100}>
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
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <CheckCircle
                          sx={{
                            color: 'primary.main',
                            mr: 1,
                            mt: 0.5,
                            fontSize: 20,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            lineHeight: 1.4,
                          }}
                        >
                          {faq.question}
                        </Typography>
                      </Box>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          ml: 3.5,
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Contact CTA */}
        <Fade in timeout={2000}>
          <Box
            sx={{
              mt: 10,
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
              Still Need Help?
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
              Don't hesitate to reach out. Our team is always ready to assist you with any questions or concerns.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              startIcon={<Email />}
              component="a"
              href="mailto:kshitijgomber@gmail.com?subject=Arrow3 Support Request"
              sx={{
                px: 4,
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
              Contact Support Team
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default SupportPage;
