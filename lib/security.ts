import './server-only';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Security Configuration for PCI DSS Compliance
export class SecurityService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  // Get encryption key from environment (32 bytes)
  private static getEncryptionKey(): Buffer {
    if (typeof window !== 'undefined') {
      throw new Error('Encryption operations are only available on the server side');
    }
    
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    return scryptSync(key, 'salt', this.KEY_LENGTH);
  }

  /**
   * Encrypt sensitive data (PCI DSS Requirement 3.4)
   * Used for storing sensitive data like payment tokens, personal information
   */
  static encryptSensitiveData(data: string): string {
    if (typeof window !== 'undefined') {
      throw new Error('Encryption operations are only available on the server side');
    }

    try {
      const key = this.getEncryptionKey();
      const iv = randomBytes(this.IV_LENGTH);
      const cipher = createCipheriv(this.ALGORITHM, key, iv);

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combine IV + tag + encrypted data
      return iv.toString('hex') + tag.toString('hex') + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt sensitive data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decryptSensitiveData(encryptedData: string): string {
    if (typeof window !== 'undefined') {
      throw new Error('Decryption operations are only available on the server side');
    }

    try {
      const key = this.getEncryptionKey();

      // Extract IV, tag, and encrypted data
      const iv = Buffer.from(encryptedData.slice(0, this.IV_LENGTH * 2), "hex");
      const tag = Buffer.from(
        encryptedData.slice(
          this.IV_LENGTH * 2,
          (this.IV_LENGTH + this.TAG_LENGTH) * 2
        ),
        "hex"
      );
      const encrypted = encryptedData.slice(
        (this.IV_LENGTH + this.TAG_LENGTH) * 2
      );

      const decipher = createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      console.error("Decryption error:", error);
      throw new Error("Failed to decrypt sensitive data");
    }
  }

  /**
   * Mask sensitive data for logging (PCI DSS Requirement 3.3)
   */
  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) {
      return "*".repeat(data?.length || 0);
    }
    return data.slice(0, visibleChars) + "*".repeat(data.length - visibleChars);
  }

  /**
   * Validate data integrity
   */
  static validateDataIntegrity(
    originalData: string,
    hashedData: string
  ): boolean {
    const crypto = require("crypto");
    const hash = crypto.createHash("sha256").update(originalData).digest("hex");
    return hash === hashedData;
  }

  /**
   * Generate secure tokens
   */
  static generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString("hex");
  }

  /**
   * Sanitize input data to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== "string") return "";

    return input
      .replace(/[<>]/g, "") // Remove potential XSS chars
      .replace(/['"`;]/g, "") // Remove SQL injection chars
      .trim();
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ""));
  }

  /**
   * Generate audit trail hash for data integrity
   */
  static generateAuditHash(data: any): string {
    const crypto = require("crypto");
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }
}
