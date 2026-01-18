import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import { JwtPayload } from '../types';

// JWT Strategy for protected routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET || 'fallback-secret',
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: JwtPayload, done) => {
    try {
      const user = await User.findById(payload.userId).select('-password');
      
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last active
            user.lastActive = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if user exists with same email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email });
            
            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const username = await generateUniqueUsername(profile.displayName || 'user');
          
          user = await User.create({
            googleId: profile.id,
            email: email,
            name: profile.displayName || 'User',
            username,
            avatar: profile.photos?.[0]?.value || '',
            isVerified: true, // Google accounts are pre-verified
          });

          return done(null, user);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Helper function to generate unique username
async function generateUniqueUsername(baseName: string): Promise<string> {
  const cleanName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
  let username = cleanName || 'user';
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${cleanName}${counter}`;
    counter++;
  }

  return username;
}

export default passport;
