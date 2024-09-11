import crypto from 'crypto'

const secret = '12345678123456781234567812345678'
const iv = '8765432187654321'

const aes_encrypt = function (plain_text) {
    const encryptor = crypto.createCipheriv('AES-256-CBC', secret, iv);
    return encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');
};

const aes_decrypt = function (encryptedMessage) {
    const decryptor = crypto.createDecipheriv('AES-256-CBC', secret, iv);
    return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
};

export {
    aes_encrypt,
    aes_decrypt
}