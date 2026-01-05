
// This file would contain authentication utility functions
import { sendEmail, sendOTP, verifyOTP as apiVerifyOTP } from './api';

export const sendVerificationEmail = async (email: string) => {
  try {
    // Generate OTP
    const otpResponse = await sendOTP(email);
    
    if (otpResponse.success) {
      // Format email message
      const subject = 'Garcia - Verify Your Email';
      const message = `
        Hello,
        
        Thank you for signing up with Garcia! To complete your registration, please use the following verification code:
        
        ${otpResponse.otp}
        
        This code is valid for 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        The Garcia Team
      `;
      
      // Send email
      return sendEmail(email, subject, message);
    }
    
    return { success: false };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false };
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    // Generate OTP
    const otpResponse = await sendOTP(email);
    
    if (otpResponse.success) {
      // Format email message
      const subject = 'Garcia - Password Reset';
      const message = `
        Hello,
        
        We received a request to reset your password for your Garcia account. Please use the following verification code to reset your password:
        
        ${otpResponse.otp}
        
        This code is valid for 10 minutes.
        
        If you didn't request this password reset, please ignore this email or contact us if you have concerns.
        
        Best regards,
        The Garcia Team
      `;
      
      // Send email
      return sendEmail(email, subject, message);
    }
    
    return { success: false };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false };
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    return apiVerifyOTP(email, otp);
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false };
  }
};
