/**
 * Email Service for ElderConnect+
 * Handles sending emails via Hostinger SMTP
 */

import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const host = process.env.EMAIL_HOST
    const port = parseInt(process.env.EMAIL_PORT || '465')
    const secure = process.env.EMAIL_SECURE === 'true'
    const user = process.env.EMAIL_USER
    const password = process.env.EMAIL_PASSWORD
    const fromName = process.env.EMAIL_FROM_NAME || 'ElderConnect+'

    if (!host || !user || !password) {
      console.warn('Email configuration incomplete. Email service disabled.')
      return
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password
      }
    })
  }

  /**
   * Send email
   */
  async send(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured')
      return false
    }

    try {
      const fromName = process.env.EMAIL_FROM_NAME || 'ElderConnect+'
      const fromEmail = process.env.EMAIL_USER

      await this.transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || ''
      })

      return true
    } catch (error) {
      console.error('Email sending error:', error)
      return false
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email: string, otp: string, expiryMinutes: number = 10): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #333; margin: 0; font-size: 24px;">Your ElderConnect+ OTP</h1>
        </div>
        
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          Thank you for using ElderConnect+. Here's your one-time password to complete your login:
        </p>
        
        <div style="background-color: #f0f4ff; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <p style="margin: 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">
            Your Code
          </p>
          <p style="margin: 0; font-size: 48px; font-weight: bold; color: #4f46e5; letter-spacing: 8px;">
            ${otp}
          </p>
        </div>
        
        <p style="color: #999; font-size: 14px; margin: 20px 0;">
          This code will expire in <strong>${expiryMinutes} minutes</strong>.
        </p>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            <strong>Security Notice:</strong> If you didn't request this code, please ignore this email. 
            Your account is secure and no one can access it without this code.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 ElderConnect+. All rights reserved.
          </p>
        </div>
      </div>
    `

    const text = `Your ElderConnect+ OTP: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.`

    return this.send({
      to: email,
      subject: `Your ElderConnect+ Login Code: ${otp}`,
      html,
      text
    })
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to ElderConnect+!</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Hi ${firstName},
          </p>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Welcome to ElderConnect+, your community-driven elderly support platform. 
            We're excited to have you join us!
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Getting Started</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your profile with additional information</li>
              <li>Browse available activities and services</li>
              <li>Connect with volunteers or elders in your community</li>
              <li>Stay safe with our verification process</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            If you have any questions or need assistance, our support team is here to help.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://elderconnect.app/dashboard" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="background-color: #f0f4ff; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 ElderConnect+. All rights reserved.<br>
            <a href="https://elderconnect.app/privacy" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
            <a href="https://elderconnect.app/terms" style="color: #667eea; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
      </div>
    `

    const text = `Welcome to ElderConnect+, ${firstName}!\n\nWe're excited to have you join our community. Visit your dashboard to get started.\n\nBest regards,\nThe ElderConnect+ Team`

    return this.send({
      to: email,
      subject: `Welcome to ElderConnect+, ${firstName}!`,
      html,
      text
    })
  }

  /**
   * Send companion request notification
   */
  async sendCompanionRequestNotification(
    elderEmail: string,
    volunteerName: string,
    activityType: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; margin-bottom: 20px;">New Companion Request!</h2>
        
        <p style="color: #666; font-size: 16px; margin-bottom: 15px;">
          <strong>${volunteerName}</strong> has accepted your companion request for <strong>${activityType}</strong>.
        </p>
        
        <div style="background-color: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #333; margin-bottom: 10px;"><strong>Next Steps:</strong></p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Review the volunteer's profile</li>
            <li>Confirm the meeting time and location</li>
            <li>Exchange contact information if needed</li>
            <li>Rate your experience after the activity</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://elderconnect.app/companion-requests" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Request Details
          </a>
        </div>
      </div>
    `

    return this.send({
      to: elderEmail,
      subject: `Great news! ${volunteerName} has accepted your request!`,
      html
    })
  }

  /**
   * Send password reset email (for future use)
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
        
        <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
          We received a request to reset your ElderConnect+ password. 
          Click the button below to create a new password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #999; font-size: 14px; margin: 20px 0;">
          This link will expire in 1 hour.
        </p>
        
        <p style="color: #999; font-size: 14px; margin: 20px 0;">
          If you didn't request this reset, please ignore this email.
        </p>
      </div>
    `

    return this.send({
      to: email,
      subject: 'Reset Your ElderConnect+ Password',
      html
    })
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService
