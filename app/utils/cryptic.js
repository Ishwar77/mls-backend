const crypto = require("crypto");
const ivLength = 16;
const keyLength = 32;

/**
 * Utility Class to perform Cryptic operations
 */
class Cryptic {

    /**
     * Utility function to create / get a random key
     * @returns String
     */
    static getKey() {
        Cryptic.key = Cryptic.key ? Cryptic.key : crypto.randomBytes(keyLength);
        return Cryptic.key;
    }

    /**
     * Utility method to Hash a given data
     * @param data String, data to be Hashed 
     * @param salt String, meta data to be appended 
     * @param algo String, OPTIONAL algorithm to use DEFAULT = 'sha256'
     * @returns String | null 
     */
    // static hash(data, salt, algo = 'sha256') {
    //     if(!data || !data.length) return null;
    //     if(!salt || !salt.length) return null;

    //     const hash = crypto.createHmac(algo, salt)
    //     .update(data)
    //     .digest('hex');

    //     return hash;
    // }

    static hash(data, salt = null, algo = 'sha256') {
        if (!data) return null;
        salt = salt ? salt : new Date().getTime().toString();
       // if (!salt || !salt.length) return null;
        const hash = crypto.createHmac(algo, salt)
            .update(data)
            .digest('hex');
        return hash;
    }

    /**
     * Utility method to Encrypt a given String
     * @param text String, data to be encrypted 
     * @param key Buffer, @see Cryptic.getKey()
     * @param algo String, OPTIONAL algorithm name, used for encryption  DEFAULT = 'aes-256-cbc'
     * @returns Object{iv: string, encryptedData: string} | null
     */
    static encrypt(text, key, algo = 'aes-256-cbc') {
        if(!text) return null;

        const iv =  crypto.randomBytes(ivLength);
        let cipher = crypto.createCipheriv(algo, Buffer.from( key ), iv);
        let encrypted = cipher.update(text);

        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
    }

    /**
     *  Utility method to Decrypt a given encrypted data and IV String
     * @param encryptedData String, Data this is been encrypted, by our Algo 
     * @param ivText String, IV Generated by our Cryptic.encrypt()
     * @param key Buffer, @see Cryptic.getKey()
     * @param algo String, OPTIONAL algorithm name, used for encryption  DEFAULT = 'aes-256-cbc'
     * @returns String | null
     */
    static decrypt(encryptedData, ivText, key, algo = 'aes-256-cbc') {
        if(!encryptedData || !ivText) return null;

        const iv = Buffer.from(ivText, 'hex');
        
        let encryptedText = Buffer.from(encryptedData, 'hex');
        let decipher = crypto.createDecipheriv(algo, Buffer.from( key ), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

    /**
     * Converts every char into binary, seperated by '_'
     * @param text String, Data to be transformed
     * @param action String, Possible inputs = ENC | DEC
     * @returns String
     * e.g. input = "Sriharsha";  output = "1010011_1110010_1101001_1101000_1100001_1110010_1110011_1101000_1100001"
     */
    static transformData(data, action, seperator = "_") {
        if(!data || !action) return null;

        const res = action === 'ENC' ?
            data.split("").map(char =>  char.charCodeAt().toString(2)).join(seperator)
                :
            data.split(seperator).map(char =>  String.fromCharCode( parseInt(char, 2) ) ).join('');
        return res;
    }
}

module.exports = Cryptic;