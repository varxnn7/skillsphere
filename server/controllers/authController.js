/*
 * ============================================================
 *  HOW TO GET GOOGLE CLIENT ID (for real OAuth):
 * ============================================================
 *  1. Go to https://console.cloud.google.com
 *  2. Create new project → name it "SkillSphere"
 *  3. APIs & Services → OAuth consent screen
 *     - User Type: External → Create
 *     - App name: SkillSphere
 *     - User support email: your Gmail address
 *     - Developer contact: your Gmail address
 *     - Save and Continue (skip optional scopes)
 *  4. APIs & Services → Credentials
 *     - Create Credentials → OAuth 2.0 Client ID
 *     - Application type: Web application
 *     - Name: SkillSphere Web Client
 *     - Authorised JavaScript origins: http://localhost:5173
 *     - Authorised redirect URIs:     http://localhost:5173
 *     - Click Create → Copy Client ID
 *  5. Paste Client ID in:
 *       server/.env  →  GOOGLE_CLIENT_ID=<your_client_id>
 *       client/.env  →  VITE_GOOGLE_CLIENT_ID=<your_client_id>
 * ============================================================
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const sendEmail = require('../utils/email');

// ── JWT helper ───────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'skillsphere_secret_key_12345', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ── @desc    Register a new user ─────────────────────────────────────
// ── @route   POST /api/auth/register ────────────────────────────────
// ── @access  Public ──────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Verify role type (admin cannot self-register)
    if (!['client', 'freelancer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Please select a valid role (client or freelancer)' });
    }

    // Generate verification token
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role,
      emailVerificationToken
    });

    // Automatically create corresponding empty profile
    if (role === 'freelancer') {
      await FreelancerProfile.create({ user: user._id });
    } else if (role === 'client') {
      await ClientProfile.create({ user: user._id });
    }

    // Create verification URL
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${emailVerificationToken}`;

    // Send verification email
    const message = `Welcome to SkillSphere, ${name}! Please verify your email by clicking the link:\n\n ${verificationUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563EB;">Welcome to SkillSphere!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering. Please verify your email address to activate your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748B;">This is an automated email. If you did not create this account, please ignore it.</p>
      </div>
    `;

    try {
      await sendEmail({ email: user.email, subject: 'SkillSphere - Email Verification Required', message, html });
    } catch (err) {
      console.error('Verification email could not be sent:', err.message);
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Login user ──────────────────────────────────────────────
// ── @route   POST /api/auth/login ───────────────────────────────────
// ── @access  Public ──────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by the platform administrator' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Verify email address ────────────────────────────────────
// ── @route   GET /api/auth/verify-email/:token ───────────────────────
// ── @access  Public ──────────────────────────────────────────────────
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Forgot Password ─────────────────────────────────────────
// ── @route   POST /api/auth/forgot-password ──────────────────────────
// ── @access  Public ──────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No user registered with this email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click the link below:\n\n ${resetUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #7C3AED;">Password Reset Request</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset for your SkillSphere account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This link is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748B;">SkillSphere Security Team</p>
      </div>
    `;

    try {
      await sendEmail({ email: user.email, subject: 'SkillSphere - Password Reset Link', message, html });
      res.status(200).json({ success: true, message: 'Reset email sent successfully' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Reset password ──────────────────────────────────────────
// ── @route   PUT /api/auth/reset-password/:token ────────────────────
// ── @access  Public ──────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Google OAuth — Register / Login ─────────────────────────
// ── @route   POST /api/auth/google-oauth ────────────────────────────
// ── @access  Public ──────────────────────────────────────────────────
//
//  Supports two modes:
//    REAL MODE  — `credential` field contains a Google ID token (JWT).
//                 Verified with google-auth-library.
//    MOCK MODE  — `email`, `name`, `role` fields supplied directly.
//                 Used during local development when GOOGLE_CLIENT_ID
//                 is not set, or when @react-oauth/google is unavailable.
//
exports.googleOAuth = async (req, res, next) => {
  try {
    const { credential, email: mockEmail, name: mockName, avatar: mockAvatar, role: bodyRole } = req.body;

    let googleEmail, googleName, googleAvatar, googleId;

    // ── Determine mode ────────────────────────────────────────────────
    if (credential && process.env.GOOGLE_CLIENT_ID) {
      // ── REAL MODE: verify Google ID token ──────────────────────────
      let OAuth2Client;
      try {
        const googleAuthLib = require('google-auth-library');
        OAuth2Client = googleAuthLib.OAuth2Client;
      } catch (e) {
        return res.status(500).json({
          success: false,
          message: 'google-auth-library is not installed. Run: npm install google-auth-library'
        });
      }

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

      let ticket;
      try {
        ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID
        });
      } catch (verifyErr) {
        return res.status(401).json({ success: false, message: 'Invalid Google token. Please try again.' });
      }

      const payload = ticket.getPayload();
      googleEmail  = payload.email;
      googleName   = payload.name;
      googleAvatar = payload.picture;
      googleId     = payload.sub;

    } else if (mockEmail) {
      // ── MOCK / SIMULATED MODE: no Google token ─────────────────────
      // Used for local development / demo mode only.
      console.log('[google-oauth] Running in SIMULATED mode. No Google token verified.');
      googleEmail  = mockEmail;
      googleName   = mockName || mockEmail.split('@')[0];
      googleAvatar = mockAvatar || '';
      googleId     = null;

    } else {
      return res.status(400).json({ success: false, message: 'Google credential or email is required' });
    }

    // ── Find or create user ───────────────────────────────────────────
    let user = await User.findOne({ email: googleEmail });

    if (user) {
      // Security Check: Block admins from using Google Auth
      if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin accounts cannot log in via Google OAuth. Please use your Admin credentials.'
        });
      }

      // Security Check: Block password-based accounts from using Google Auth
      if (!user.isGoogleAuth) {
        return res.status(401).json({
          success: false,
          message: 'This email is registered with a password. Please log in using your password credentials.'
        });
      }

      // Existing user — just log them in
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified
        }
      });
    }

    // New user — determine role (admin can only come from mock/seed, not Google flow)
    let finalRole = bodyRole || 'client';
    // Safety: prevent creating admin via Google OAuth in real mode
    if (credential && finalRole === 'admin') {
      finalRole = 'client';
    }

    user = await User.create({
      name: googleName,
      email: googleEmail,
      password: googleId ? `GOOGLE_AUTH_${googleId}` : undefined,
      role: finalRole,
      avatar: googleAvatar,
      isGoogleAuth: true,
      isEmailVerified: true // Google already verified the email
    });

    // Create role-based profile
    if (finalRole === 'freelancer') {
      await FreelancerProfile.create({ user: user._id });
    } else if (finalRole === 'client') {
      await ClientProfile.create({ user: user._id });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Get current logged-in user ──────────────────────────────
// ── @route   GET /api/auth/me ────────────────────────────────────────
// ── @access  Private ─────────────────────────────────────────────────
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── @desc    Logout ──────────────────────────────────────────────────
// ── @route   POST /api/auth/logout ──────────────────────────────────
// ── @access  Private ─────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
