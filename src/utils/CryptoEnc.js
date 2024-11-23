import crypto from 'crypto';

export class AESUtils {
    // —------- Encryption Method —-----------
    static async EncryptRequest(incomingJsonReq, key) {
        const decodedKey = Buffer.from(key, 'base64');
        if (decodedKey.length !== 32) {
            throw new Error("Invalid key");
        }
        // Generate a random IV
        const iv = crypto.randomBytes(16);
        console.log("IV generated: " + iv.toString('hex'));
        // Convert payload to byte array
        const payloadBytes = Buffer.from(JSON.stringify(incomingJsonReq));
        // Initialize AES cipher
        const cipher = crypto.createCipheriv('aes-256-cbc', decodedKey, iv);
        // Encrypt the data
        const encryptedBytes = Buffer.concat([cipher.update(payloadBytes), cipher.final()]);
        // Combine IV and encrypted data
        const result = Buffer.concat([iv, encryptedBytes]);
        // Return Base64 encoded result
        return result.toString('base64');
    }
    // —-------- Decryption Method -----------
    static async decryptRequest(encryptedString, key) {
        // Decode Base64 encoded input and key
        const byteCipherText = Buffer.from(encryptedString, 'base64');
        const byteKey = Buffer.from(key, 'base64');
        // Extract IV and cipher text from the encrypted input
        const iv = byteCipherText.slice(0, 16);
        const cipherText = byteCipherText.slice(16);
        // Initialize AES cipher for decryption
        const decipher = crypto.createDecipheriv('aes-256-cbc', byteKey, iv);
        // Decrypt the cipher text
        const bytePlainText = Buffer.concat([decipher.update(cipherText), decipher.final()]);
        // Clean the decrypted data and return
        return this.removeNoise(bytePlainText.toString('utf-8').trim());
    }
    // Removing noise and returning clean string up to } or ]
    static removeNoise(data) {
        const lastCurlyBrace = data.lastIndexOf('}');
        const lastSquareBracket = data.lastIndexOf(']');
        const lastIndex = Math.max(lastCurlyBrace, lastSquareBracket);
        if (lastIndex !== -1) {
            return data.substring(0, lastIndex + 1);
        }
        return data;
    }
}

let jsonObj = {
    client_id: "42Zuw71Ok7e2TGAgHPKttM7PFGMspJLLy3ewq15dhgjtGM9l",
    client_secret: "MDB9krmA8OqYdgjTKflkXXU7BTNAJgVDEWBmhWjQ8YBvAPNKNPLbxnJGSKcKiEV9",
    epoch: String(Date.now())
}

let BodyObj = {
    beneName: "Ajay Kumar",
    beneAccountNo: "2211217740244935",
    beneifsc: "AUBL0002177",
    benePhoneNo: 9177756865,
    clientReferenceNo: "DdsfAD8783268F09C",
    amount: 101,
    fundTransferType: "IMPS",
    latlong: "22.8031731,88.7874172",
    pincode: 751004,
    custName: "Ajay Kumar",
    custMobNo: 8000623206,
    custIpAddress: "110.235.219.55",
    beneBankName: "AU SMALL FINANCE BANK",
    paramA: "",
    paramB: ""
}

let decD = "Zp5w93gqiVzT0oX62qnHQskduVgATY8fEgFDMoeOSFqKWJREgCZVw91ePf3ya8HtOWIAWzQdF77oXeBGRexWRAJPwyiqGn1DhnPhYC/667CZBKzW54i+xSRnxnLszVB98hmp1hagFs9+A2FnZ2JiIDxFJFRR8V53Pf6m5lc8SfO1jY76POLiweROovdx7PwkdvuRb5EriRrFoxVEd6ZT7XUGtSyeoj1tdcKbxt7gHeK0499fQ9GoBWhRWRqFEHUTyt6uXPYxMX8mb9/c7E9BLjpLypE8aNiKevVet+ohjLbCm3L4YOGC0ocUE4nAYCuBfOWiWpzwQ1gtksY4KuSGtRVgmF2PPWUGAoHE1cpxJfQjdQZd9Zhdjvb/GR3kgBpm6R4Mx2m06Duwd1PVR52tuB21RszSDxdVOk6OBJGjt/lh/P01cAQ7Nedwk7zjw0+NTtR+TSVgKa20RXmSEJEQdLfenidetrNrwOeDLAOBKZS+5YB0mln5/APx+RswBTWxRwRQq0gOWhPzSQr+7l+4665yqyDUCDMLbjCgGacrvIs4fruJ6upG2Z5S80a6Ij0lGzhdxdZAkBzOHYTyDUVbnFQVCuYsufw1dHbN1lQ4SgNoZ4++IgGFAjVGful4TawkBvzmUqhLKqY1v1uJBgY92a48C7HM3JUMycBX5ue6u9QaM8kkbz+d7APn8AebVxkXF+YTn3MbKg7+2SbAKkSjp1yadksp0MN1/0uPbs7JmwE="

let EncKey = "a6T8tOCYiSzDTrcqPvCbJfy0wSQOVcfaevH0gtwCtoU="

// let cryptoFunc = new AESUtils()
// cryptoFunc.EncryptRequest(jsonObj, EncKey)

let d1 = AESUtils?.EncryptRequest(BodyObj, EncKey)
let d2 = AESUtils?.decryptRequest(decD, EncKey)
// let nosie = AESUtils?.removeNoise(d)

console.log(d2)