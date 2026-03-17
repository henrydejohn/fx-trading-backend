import { Html, Head, Body, Container, Text, Section, Heading } from '@react-email/components';
import * as React from 'react';

interface OtpEmailProps {
  otp: string;
}

export const OtpEmail = ({ otp }: OtpEmailProps) => {
  const formattedOtp = otp.split('').join(' ');

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={heading}>Verify your FX account</Heading>

            <Text style={description}>
              Use the verification code below to continue signing in to your FX account.
            </Text>

            <Section style={otpContainer}>
              <Text style={otpStyle}>{formattedOtp}</Text>
            </Section>

            <Text style={expiry}>
              This code will expire in <strong>10 minutes</strong>.
            </Text>

            <Section style={divider} />

            <Text style={security}>
              If you didn’t attempt to sign in, you can safely ignore this email. Your account
              remains secure.
            </Text>
          </Section>

          <Text style={footer}>Secure verification • FX Platform</Text>
        </Container>
      </Body>
    </Html>
  );
};

/* Base */

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
  padding: '40px 16px',
};

/* Layout */

const container: React.CSSProperties = {
  margin: '0 auto',
  maxWidth: '480px',
};

/* Card */

const card: React.CSSProperties = {
  border: '1px solid #eaeaea',
  borderRadius: '10px',
  padding: '32px',
};

/* Heading */

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 600,
  margin: '0 0 12px',
  color: '#000',
};

/* Description */

const description: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#444',
  marginBottom: '24px',
};

/* OTP */

const otpContainer: React.CSSProperties = {
  border: '1px solid #eaeaea',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center',
  marginBottom: '24px',
};

const otpStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 600,
  letterSpacing: '8px',
  margin: 0,
  color: '#000',
};

/* Expiry */

const expiry: React.CSSProperties = {
  fontSize: '13px',
  color: '#555',
  marginBottom: '24px',
};

/* Divider */

const divider: React.CSSProperties = {
  borderTop: '1px solid #eaeaea',
  margin: '24px 0',
};

/* Security */

const security: React.CSSProperties = {
  fontSize: '13px',
  color: '#777',
  lineHeight: '20px',
};

/* Footer */

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  textAlign: 'center',
  marginTop: '20px',
};
