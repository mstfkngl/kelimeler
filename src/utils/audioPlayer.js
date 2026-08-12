export const playAudio = (fileName) => {
  return new Promise((resolve) => {
    // public klasöründeki dosyayı doğrudan çağırıyoruz
    const audio = new Audio(`/assets/audio/${fileName}`);
    
    // Ses normal şekilde bittiğinde çöz (resolve)
    audio.onended = resolve;
    
    // Eğer dosya bulunamazsa (sen GitHub'a yükleyene kadar) oyun kilitlenmesin
    audio.onerror = () => {
      console.warn(`Uyarı: ${fileName} bulunamadı, sessiz geçiliyor.`);
      setTimeout(resolve, 2000); // 2 saniye bekle ve devam et
    };

    // Sesi oynatmayı dene, tarayıcı engellerse yakala
    audio.play().catch((e) => {
      console.warn("Tarayıcı otomatik ses oynatmayı engelledi:", e);
      setTimeout(resolve, 2000);
    });
  });
};