// n8n'deki anahtarın AYNISI olmalı
const SECRET_KEY = "golge_benlik_gizli_anahtarim"; 

// ŞİFRE ÇÖZME (Okurken)
export const simpleDecrypt = (encryptedText: string): string => {
  if (!encryptedText) return "";
  try {
    const binaryString = atob(encryptedText);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const text = new TextDecoder('utf-8').decode(bytes);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return result;
  } catch (e) {
    console.error("Şifre çözme hatası:", e);
    return encryptedText;
  }
};

// YENİ: ŞİFRELEME (Kaydederken)
export const simpleEncrypt = (text: string): string => {
  if (!text) return "";
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    // UTF-8 uyumlu Base64 çevrimi
    const bytes = new TextEncoder().encode(result);
    const binaryString = String.fromCodePoint(...bytes);
    return btoa(binaryString);
  } catch (e) {
    console.error("Şifreleme hatası:", e);
    return text;
  }
};
