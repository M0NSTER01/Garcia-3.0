
// This file would contain all API-related functions

export const sendEmail = async (to: string, subject: string, message: string) => {
  // In a real application, this would call an API endpoint
  // For this demo, we're simulating the API call
  console.log(`Sending email to ${to} with subject: ${subject}`);
  console.log(`Email content: ${message}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success
  return { success: true };
};

export const sendOTP = async (email: string) => {
  // In a real application, this would generate and send an OTP
  // For this demo, we're simulating the API call
  console.log(`Generating OTP for ${email}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Always return the same OTP for demo purposes
  // In a real app, this would be randomly generated
  const mockOTP = '123456';
  console.log(`Generated OTP: ${mockOTP} for ${email}`);
  
  return { success: true, otp: mockOTP };
};

export const verifyOTP = async (email: string, otp: string) => {
  // In a real application, this would verify the OTP against what was sent
  // For this demo, we're simulating the API call
  console.log(`Verifying OTP ${otp} for ${email}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, any OTP of '123456' is valid
  const isValid = otp === '123456';
  console.log(`OTP verification ${isValid ? 'successful' : 'failed'}`);
  
  return { success: isValid };
};
