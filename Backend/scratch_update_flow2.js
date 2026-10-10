const fs = require('fs');
const file = 'c:/projects/Mozhibu - Story/Backend/src/routes/auth.js';
let content = fs.readFileSync(file, 'utf8');

// Replace forgot password logic
const forgotStart = content.indexOf('// @route   POST /api/auth/forgot-password');
const changeStart = content.indexOf('// @route   PUT /api/auth/change-password');

if (forgotStart !== -1 && changeStart !== -1) {
    const beforeForgot = content.slice(0, forgotStart);
    const afterChange = content.slice(changeStart);

    const newLogic = `// @route   POST /api/auth/forgot-password
// @desc    Generate 6-digit reset code and send email
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "There is no user with that email" });
    }

    if (user.authProvider !== "normal") {
      return res
        .status(400)
        .json({
          msg: \`You signed up with \${user.authProvider}, password reset is not applicable.\`,
        });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash code and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    // Send email using Resend
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Mozhibu <support@mozhibu.com>",
        to: [user.email],
        subject: "Mozhibu - Password Reset Code",
        html: \`
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #2F4F4F;">Password Reset Request</h2>
            <p>Hello \${user.username},</p>
            <p>You requested to reset your password. Please use the following 6-digit code to verify your request:</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #333;">\${resetCode}</span>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This code is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        \`,
      });

      if (error) {
        throw error;
      }

      res.json({ msg: "Password reset code has been sent to your email." });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);

      // Reset the token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      
      console.log("\\n--- EMAIL FAILED. RESET CODE ---");
      console.log(resetCode);
      console.log("----------------------------------\\n");

      return res
        .status(500)
        .json({
          msg: "Email could not be sent. Please check backend console for the code.",
        });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/verify-reset-code
// @desc    Verify 6-digit reset code
// @access  Public
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ msg: "Please provide email and code" });
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }

    res.json({ msg: "Code verified successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using 6-digit code
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    // Also accept email for better security with 6-digit codes
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ msg: "Please provide email, code, and new password" });
    }

    // Get hashed code
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(code)
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset code" });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])[\\S]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          msg: "Password must be 8-16 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces.",
        });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: "Password successfully updated! You can now log in." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

`;

    fs.writeFileSync(file, beforeForgot + newLogic + afterChange);
    console.log('Success string slice replace');
} else {
    console.log('Failed to find start or end tags');
}
