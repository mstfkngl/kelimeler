export const playAudio = (fileName) => {
  return new Promise((resolve) => {
    // Vite'in otomatik base yolunu alıyoruz (GitHub Pages'te /kelimeler/ olur)
    const basePath = import.meta.env.BASE_URL;
    const audioPath = `${basePath}assets/audio/${fileName}`;
    
    const audio = new Audio(audioPath);
    
    // 1. Senaryo: Ses başarıyla çalar ve biterse
    audio.onended = () => {
      resolve();
    };

    // 2. Senaryo: Dosya bulunamazsa (404) oyunu KİLİTLEMEMEK için devam et
    audio.onerror = () => {
      console.warn(`Ses dosyası yüklenemedi, atlanıyor: ${audioPath}`);
      resolve(); 
    };

    // Ses çalma işlemi tarayıcı (Autoplay engeli vb.) tarafından reddedilirse devam et
    audio.play().catch((error) => {
      console.warn(`Ses çalınamadı (Tarayıcı engeli):`, error);
      resolve();
    });
  });
};