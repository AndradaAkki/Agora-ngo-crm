const express = require('express');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../graphql/schema');

const router = express.Router();
const prisma = new PrismaClient();

//  Helper 

async function findOrCreateOAuthUser(provider, providerId, profile) {
  const idField = provider === 'google' ? 'googleId' : 'githubId';
  const email = profile.emails?.[0]?.value || null;
  const displayName = profile.displayName || profile.username || 'User';
  const avatarUrl = profile.photos?.[0]?.value || null;

  // 1. Already linked to this OAuth account
  let user = await prisma.user.findUnique({ where: { [idField]: providerId } });
  if (user) return user;

  // 2. Email matches an existing account → link it
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return prisma.user.update({ where: { id: user.id }, data: { [idField]: providerId } });
    }
  }

  // 3. Brand-new user — create with least-privilege role
  const baseUsername = (email?.split('@')[0] || displayName)
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 20);
  const username = `${baseUsername}_${providerId.slice(0, 6)}`;

  return prisma.user.create({
    data: {
      email: email || `${providerId}@${provider}.oauth`,
      username,
      displayName,
      avatarUrl,
      password: null,
      role: 'Externe CD',
      isAdmin: false,
      [idField]: providerId,
    },
  });
}

// ─── Strategies ───────────────────────────────────────────────────────────────

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'https://localhost:3000/auth/google/callback',
  scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  try { done(null, await findOrCreateOAuthUser('google', profile.id, profile)); }
  catch (err) { done(err); }
}));

passport.use(new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  process.env.GITHUB_CALLBACK_URL || 'https://localhost:3000/auth/github/callback',
  scope: ['user:email'],
}, async (accessToken, refreshToken, profile, done) => {
  try { done(null, await findOrCreateOAuthUser('github', profile.id, profile)); }
  catch (err) { done(err); }
}));

// JWT-based — no session serialization needed
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// JWT redirect helper 

function issueJwtAndRedirect(req, res) {
  const user = req.user;
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  // Frontend strips ?token= from the URL bar immediately after saving it
  res.redirect(`https://${req.get('host')}/?token=${token}`);
}

//  Routes 

router.get('/google',
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=oauth_failed' }),
  issueJwtAndRedirect
);

router.get('/github',
  passport.authenticate('github', { session: false, scope: ['user:email'] })
);
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login?error=oauth_failed' }),
  issueJwtAndRedirect
);

module.exports = { router, passport };
