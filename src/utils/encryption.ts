// n8n'deki anahtarın AYNISI olmalı
const SECRET_KEY = "golge_benlik_gizli_anahtarim"; 

export const simpleDecrypt = (encryptedText: string): string => {
  if (!encryptedText) return "";
  try {
    // 1. Base64'ten binary string'e çevir
    const binaryString = atob(encryptedText);

    // 2. Binary string'i Byte dizisine (Uint8Array) çevir
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 3. Byte dizisini UTF-8 olarak çöz (Node.js Buffer mantığını taklit ediyoruz)
    // Bu adım, Türkçe karakterlerin bozulmasını engeller.
    const text = new TextDecoder('utf-8').decode(bytes);

    // 4. XOR İşlemi (Şifreyi Çöz)
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  } catch (e) {
    console.error("Şifre çözme hatası:", e);
    return encryptedText; // Hata olursa olduğu gibi döndür
  }
};
