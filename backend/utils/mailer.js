import nodemailer from 'nodemailer';

let transporter = null;

export const initMailer = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const cleanUser = process.env.SMTP_USER.replace(/^"|"$/g, '').trim();
    const cleanPass = process.env.SMTP_PASS.replace(/^"|"$/g, '').trim();
    const isGmail = cleanUser.includes('@gmail.com') || process.env.SMTP_HOST === 'smtp.gmail.com';
    const host = isGmail ? 'smtp.gmail.com' : (process.env.SMTP_HOST || 'smtp.gmail.com');
    const port = Number(process.env.SMTP_PORT) || (isGmail ? 587 : 587);

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: cleanUser,
        pass: cleanPass,
      },
    });
    console.log(`[Mailer] Initialized with SMTP config (${host}:${port}) for ${cleanUser}`);
  } else {
    // Development / fallback transporter
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Mailer] Initialized Ethereal fallback: ${testAccount.user}`);
    } catch (err) {
      console.log('[Mailer] Fallback to console logger (SMTP credentials not provided)');
      transporter = null;
    }
  }
};

const sendMailSafely = async (mailOptions) => {
  try {
    if (!transporter) {
      await initMailer();
    }
    if (transporter) {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Zokep CRM" <no-reply@zokepcrm.com>',
        ...mailOptions,
      });
      console.log(`[Mailer] Email sent: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`[Mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId };
    } else {
      console.log('--- [MAIL LOG (MOCK)] ---');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body:\n${mailOptions.text || mailOptions.html}`);
      console.log('-------------------------');
      return { success: true, mock: true };
    }
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${mailOptions.to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Send credentials to newly registered Tenant Admin
export const sendAdminWelcomeEmail = async ({ to, name, email, password, companyName, planName, loginUrl }) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">Welcome to Zokep CRM! 🚀</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 15px;">Your SaaS Lead Management Workspace is Ready</p>
      </div>
      <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
        <p>Thank you for subscribing to the <strong>${planName || 'Pro'}</strong> plan for <strong>${companyName || 'your business'}</strong>. Your Admin CRM account has been provisioned successfully.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Your Admin Login Credentials:</h3>
          <p style="margin: 6px 0;"><strong>Portal URL:</strong> <a href="${loginUrl || 'http://localhost:5173/login'}" style="color: #4f46e5;">${loginUrl || 'http://localhost:5173/login'}</a></p>
          <p style="margin: 6px 0;"><strong>Email:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${email}</code></p>
          <p style="margin: 6px 0;"><strong>Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
          <p style="margin: 6px 0; font-size: 13px; color: #64748b;">(For security, you can change your password anytime in Profile settings)</p>
        </div>

        <div style="text-align: center; margin: 30px 0 20px;">
          <a href="${loginUrl || 'http://localhost:5173/login'}" style="background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; display: inline-block;">Login to Admin Dashboard</a>
        </div>

        <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          © ${new Date().getFullYear()} Zokep CRM. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return await sendMailSafely({
    to,
    subject: `🚀 Your Zokep CRM Admin Credentials (${companyName || 'Business'})`,
    html,
  });
};

// Send credentials to newly created Staff Member
export const sendStaffWelcomeEmail = async ({ to, name, email, password, companyName, loginUrl }) => {
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: #0ea5e9; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h2 style="margin: 0; font-size: 22px; font-weight: 700;">You've been invited to ${companyName || 'Zokep CRM'}! 👥</h2>
        <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Your Staff Member Login Access</p>
      </div>
      <div style="padding: 28px 24px; color: #334155; line-height: 1.6;">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your team admin at <strong>${companyName}</strong> has created a CRM consultant account for you to manage and follow up with leads.</p>
        
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 18px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0369a1;">Your Login Details:</h4>
          <p style="margin: 5px 0;"><strong>Portal URL:</strong> <a href="${loginUrl || 'http://localhost:5173/login'}" style="color: #0284c7;">${loginUrl || 'http://localhost:5173/login'}</a></p>
          <p style="margin: 5px 0;"><strong>Login Email:</strong> <code>${email}</code></p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code>${password}</code></p>
        </div>

        <div style="text-align: center; margin: 25px 0 15px;">
          <a href="${loginUrl || 'http://localhost:5173/login'}" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 26px; border-radius: 6px; font-weight: 600; display: inline-block;">Access Staff Portal</a>
        </div>
      </div>
    </div>
  `;

  return await sendMailSafely({
    to,
    subject: `🔐 Staff Login Credentials - ${companyName || 'Zokep CRM'}`,
    html,
  });
};

// Send custom email using template
export const sendCustomLeadEmail = async ({ to, subject, html, replyTo, fromName }) => {
  return await sendMailSafely({
    to,
    subject,
    html,
    replyTo,
    from: fromName ? `"${fromName}" <no-reply@zokepcrm.com>` : undefined,
  });
};
