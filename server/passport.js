const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true, // <--- ADD THIS LINE (Forces HTTPS callback)
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user exists by Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        // 2. SAFETY CHECK: Check if user exists by Email
        // (This prevents the "Duplicate Key" error)
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // If found by email, just link the Google ID to this existing account
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

        // 3. If neither exists, create a new user
        user = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
        });

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});