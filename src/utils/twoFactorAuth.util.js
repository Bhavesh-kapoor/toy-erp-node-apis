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

export const verifyOTP = (secret, token) => {
  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      token: token,
    });
    return verified;
  } catch (err) {
    console.error("Error verifying OTP:", err);
  }
};
