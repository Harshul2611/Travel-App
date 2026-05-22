import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        const name = profile.displayName;

        if (!email) {
          return done(new Error("No email found from Google"), undefined);
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // Update googleId and avatar if missing
          if (!user.googleId) {
            user.googleId = profile.id;
            if (avatar !== undefined) user.avatar = avatar;
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name,
          email,
          googleId: profile.id,
          ...(avatar !== undefined && { avatar }),
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

export default passport;
