const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Google OAuth Strategy (only if credentials are provided)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with the same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link existing account with Google
      user.googleId = profile.id;
      user.isEmailVerified = true; // Google accounts are pre-verified
      await user.save();
      return done(null, user);
    }
    
    // Create new user from Google profile
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      isEmailVerified: true,
      // Generate a random password for OAuth users (they won't use it)
      password: Math.random().toString(36).slice(-12) + 'A1!'
    });
    
    await user.save();
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
  }));
} else {
  console.warn('Google OAuth not configured - Google authentication will not be available');
}

// JWT Strategy for API authentication
if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: 'arrow3-aerospace',
    audience: 'arrow3-users'
  }, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
  }));
} else {
  console.warn('JWT_SECRET not configured - JWT authentication will not be available');
}

// Serialize user for session (not used in JWT auth, but required by Passport)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session (not used in JWT auth, but required by Passport)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;