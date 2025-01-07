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

export const generateSecret = () => {
  return speakeasy.generateSecret({ length: 20 }).base32;
};

export const generateToken = (validity) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const customValidityWindow = 10; // Token is valid for 5 steps (5 * 30 seconds = 150 seconds)

  const otp = speakeasy.totp({
    secret: secret.base32,
    encoding: "base32",
    step: 30,
    window: customValidityWindow,
  });
  return { otp, secret: secret.base32 };
};

export const verifyOTP = (secret, otp, window) => {
  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      token: otp,
      ...(window ? { window } : {}),
    });
    console.log(verified);
    return verified;
  } catch (err) {
    console.error("Error verifying OTP:", err);
  }
};
