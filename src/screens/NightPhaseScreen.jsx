import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { playAudio } from '../utils/audioPlayer';
import { selectWordsForMayor } from '../utils/wordSelector';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function NightPhaseScreen({ onComplete }) {
  const { players, setMagicWord, magicWord, settings } = useGameStore();
  const [step, setStep] = useState('pass-and-play'); 
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRoleVisible, setIsRoleVisible] = useState(false);
  const [wordsData, setWordsData] = useState(null);
  const [mayorOptions, setMayorOptions] = useState([]);
  
  const currentPlayer = players[currentPlayerIndex];

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}assets/data/words.json`)
      .then(res => res.json())
      .then(data => setWordsData(data))
      .catch(err => console.warn("Kelime dosyası bulunamadı", err));
  }, []);

  // Görünmez Zamanlayıcılar (Otomatik Uyutma)
  useEffect(() => {
    let timer;
    if (step === 'seer-viewing') {
      timer = setTimeout(() => handleSeerDone(), settings.nightViewTime * 1000);
    } else if (step === 'werewolf-viewing') {
      timer = setTimeout(() => handleWerewolfDone(), settings.nightViewTime * 1000);
    }
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, settings.nightViewTime]);

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) setCurrentPlayerIndex(prev => prev + 1);
    else setStep('night-ready'); 
  };

  const startNightSequence = async () => {
    setStep('mayor-waking');
    await playAudio('wake_mayor.mp3');
    const mayor = players.find(p => p.isMayor);
    setMayorOptions(selectWordsForMayor(wordsData, mayor.secretRole));
    setStep('mayor-choosing');
  };

  const handleWordSelect = async (word) => {
    setMagicWord(word);
    setStep('mayor-sleeping');
    await playAudio('sleep_mayor.mp3');
    setStep('seer-waking');
    await playAudio('wake_seer.mp3');
    setStep('seer-viewing');
  };

  const handleSeerDone = async () => {
    setStep('seer-sleeping');
    await playAudio('sleep_seer.mp3');
    setStep('werewolf-waking');
    await playAudio('wake_werewolf.mp3');
    setStep('werewolf-viewing');
  };

  const handleWerewolfDone = async () => {
    setStep('werewolf-sleeping');
    await playAudio('sleep_werewolf.mp3');
    onComplete(); 
  };

  const roleNames = { villager: "Köylü", seer: "Falcı", werewolf: "Kurt Adam" };

  return (
    <div className="w-full max-w-md bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 flex flex-col items-center text-center">
      {step === 'pass-and-play' && (
        <div className="w-full flex flex-col items-center animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Cihazı Devret</h2>
          <p className="mb-8">Sıradaki: <span className="font-bold text-xl">{currentPlayer.name}</span></p>
          <button
            onMouseDown={() => setIsRoleVisible(true)}
            onMouseUp={() => setIsRoleVisible(false)}
            onMouseLeave={() => setIsRoleVisible(false)}
            onTouchStart={() => setIsRoleVisible(true)}
            onTouchEnd={() => setIsRoleVisible(false)}
            className="w-full py-12 rounded-xl bg-slate-700 border-2 border-slate-600 flex flex-col items-center select-none"
          >
            {isRoleVisible ? (
              <span className="text-2xl font-bold text-white">Rolün: {roleNames[currentPlayer.secretRole]} {currentPlayer.isMayor && "👑"}</span>
            ) : (
              <span className="text-slate-300">Görmek için basılı tut</span>
            )}
          </button>
          <button onClick={handleNextPlayer} className="mt-6 text-emerald-400 font-bold flex items-center gap-2">Sıradakine Geç <CheckCircle size={20}/></button>
        </div>
      )}

      {step === 'night-ready' && (
        <button onClick={startNightSequence} className="w-full py-4 bg-indigo-600 font-bold rounded-xl text-white animate-fade-in">Geceyi Başlat</button>
      )}

      {step === 'mayor-choosing' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-yellow-400 font-bold mb-4">Sihirli Kelimeyi Seç:</h2>
          <div className="flex flex-col gap-3">
            {mayorOptions.map((w, i) => (
              <button key={i} onClick={() => handleWordSelect(w)} className="py-4 bg-slate-700 font-bold text-xl text-white rounded-xl hover:bg-slate-600 transition-colors">{w}</button>
            ))}
          </div>
        </div>
      )}

      {/* DÜZELTİLEN KISIM: 4 Yönlü Kenara Yaslanmış Kelime Gösterimi */}
      {(step === 'seer-viewing' || step === 'werewolf-viewing') && (
        <div className="w-full aspect-square max-w-[340px] mx-auto bg-slate-900 rounded-2xl relative shadow-inner overflow-hidden animate-fade-in border border-slate-700">
           
           {/* Ana Oyuncu Yönü (Alt Kenar) */}
           <div className="absolute inset-0 flex items-end justify-center pb-6">
             <span className="text-3xl font-black text-white tracking-widest whitespace-nowrap">{magicWord}</span>
           </div>
           
           {/* Karşı Oyuncu Yönü (Üst Kenar) */}
           <div className="absolute inset-0 rotate-180 flex items-end justify-center pb-6">
             <span className="text-3xl font-black text-white tracking-widest whitespace-nowrap">{magicWord}</span>
           </div>
           
           {/* Sağ Oyuncu Yönü (Sağ Kenar) */}
           <div className="absolute inset-0 rotate-90 flex items-end justify-center pb-6">
             <span className="text-3xl font-black text-white tracking-widest whitespace-nowrap">{magicWord}</span>
           </div>
           
           {/* Sol Oyuncu Yönü (Sol Kenar) */}
           <div className="absolute inset-0 -rotate-90 flex items-end justify-center pb-6">
             <span className="text-3xl font-black text-white tracking-widest whitespace-nowrap">{magicWord}</span>
           </div>

        </div>
      )}
    </div>
  );
}