// n8n'deki anahtarın AYNISI olmalı
const SECRET_KEY = "golge_benlik_gizli_anahtarim"; 

export const simpleDecrypt = (encryptedText: string): string => {
  if (!encryptedText) return "";
  try {
    // Base64'ten çevir
    const text = atob(encryptedText);
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
