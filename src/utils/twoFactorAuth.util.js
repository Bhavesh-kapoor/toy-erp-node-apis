import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const generateQRCode = async ({ label, issuer }) => {
  try {
    const secret = speakeasy.generateSecret({ length: 20 });
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label,
      issuer,
    });

    const qrCode = await QRCode.toDataURL(otpauthUrl);
    return { secret: secret.base32, qrCode };
  } catch (err) {
    console.error("Error generating QR code:", err);
  }
};

export const generateToken = () => {
  const secret = speakeasy.generateSecret({ length: 20 });

  const otp = speakeasy.totp({
    secret: secret.base32,
  });
  return { otp, secret: secret.base32 };
};

export const verifyOTP = (secret, otp, window) => {
  try {
    const options = {
      secret: secret,
      token: otp,
      ...(window ? { window } : {}),
    };
    const verified = speakeasy.totp.verify(options);
    return verified;
  } catch (err) {
    console.error("Error verifying OTP:", err);
  }
};
