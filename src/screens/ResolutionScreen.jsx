import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Skull, ShieldCheck, CheckCircle2, RotateCcw, Eye, Users, Target } from 'lucide-react';

export default function ResolutionScreen({ onQuickRestart, onGoToLobby }) {
  const { players, dayEndReason, guesserId, magicWord, settings } = useGameStore();
  
  const [step, setStep] = useState('init');
  const [timeLeft, setTimeLeft] = useState(0);
  const [winner, setWinner] = useState(null);
  
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [wwSelectedPlayers, setWwSelectedPlayers] = useState([]);

  const werewolves = players.filter(p => p.secretRole === 'werewolf');
  const guesser = players.find(p => p.id === guesserId);

  const roleNames = {
    villager: "Köylü",
    seer: "Falcı",
    werewolf: "Kurt Adam"
  };

  useEffect(() => {
    if (dayEndReason === 'word_guessed') {
      setStep('reveal_before_hunt');
    } else {
      setStep('village_discussion');
      setTimeLeft(settings.villageVoteTime);
    }
  }, [dayEndReason, settings.villageVoteTime]);

  useEffect(() => {
    if (timeLeft <= 0 && step !== 'init' && step !== 'reveal_before_hunt' && step !== 'result') {
      if (step === 'werewolf_turn') { 
        setWinner('village'); 
        setStep('result'); 
      } 
      else if (step === 'village_discussion') { 
        setStep('village_voting'); 
      }
    }
    const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, step]);

  const startWerewolfHunt = () => {
    setStep('werewolf_turn');
    setTimeLeft(settings.werewolfTurnTime);
  };

  const toggleWwSelection = (playerId) => {
    setWwSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        if (prev.length < werewolves.length) {
          return [...prev, playerId];
        }
        return prev; 
      }
    });
  };

  const handleWwHuntSubmit = () => {
    const isSeerFound = wwSelectedPlayers.some(id => {
      const p = players.find(player => player.id === id);
      return p.secretRole === 'seer';
    });

    if (isSeerFound) {
      setWinner('werewolf'); 
    } else {
      setWinner('village');  
    }
    setStep('result');
  };

  const handleVillageVoteSubmit = () => {
    const isCaught = selectedPlayers.some(id => players.find(p => p.id === id).secretRole === 'werewolf');
    setWinner(isCaught ? 'village' : 'werewolf');
    setStep('result');
  };

  return (
    <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 flex flex-col items-center text-center">
      
      {step === 'reveal_before_hunt' && (
        <div className="animate-fade-in w-full">
          <Eye size={64} className="text-emerald-400 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-6">KELİME BULUNDU!</h2>
          <div className="bg-slate-700 p-4 rounded-xl mb-6">
            <span className="text-lg text-slate-300 block">Sihirli Kelimeyi Bilen:</span>
            <span className="text-2xl font-bold text-emerald-400">{guesser?.name}</span>
          </div>
          <div className="bg-red-900/40 p-4 rounded-xl border border-red-500/50 mb-8">
            <span className="text-lg text-red-200 block mb-2">Aramızdaki Kurt Adam(lar):</span>
            <span className="text-2xl font-black text-red-500">{werewolves.map(w => w.name).join(", ")}</span>
          </div>
          <button onClick={startWerewolfHunt} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg transition-colors">
            Falcı Avını Başlat ({settings.werewolfTurnTime} Sn)
          </button>
        </div>
      )}

      {step === 'werewolf_turn' && (
        <div className="w-full animate-fade-in">
          <Skull size={48} className="text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-black text-white mb-2">FALCIYI BULUN!</h2>
          <p className="text-slate-300 mb-2">Kalan Süre: <span className="font-bold text-red-400">{timeLeft}</span> saniye</p>
          
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 mb-6 inline-block mx-auto">
            <p className="text-red-300 font-bold">
              Seçilen Hedefler: <span className="text-white text-xl">{wwSelectedPlayers.length}</span> / {werewolves.length}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            {players.filter(p => p.secretRole !== 'werewolf').map(p => (
              <button 
                key={p.id} 
                onClick={() => toggleWwSelection(p.id)} 
                className={`py-4 font-bold rounded-xl border-2 transition-all flex justify-center items-center gap-2 ${
                  wwSelectedPlayers.includes(p.id) 
                    ? 'bg-red-600 border-red-400 text-white shadow-lg' 
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {p.name} {wwSelectedPlayers.includes(p.id) && <CheckCircle2 size={20} />}
              </button>
            ))}
          </div>

          <button 
            onClick={handleWwHuntSubmit}
            disabled={wwSelectedPlayers.length !== werewolves.length}
            className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-xl rounded-xl transition-all"
          >
            Avı Tamamla
          </button>
        </div>
      )}

      {/* TARTIŞMA AŞAMASI (İstediğin uyarı metni eklendi) */}
      {step === 'village_discussion' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-3xl font-black text-white mb-3">TARTIŞMA BAŞLADI</h2>
          
          <div className="bg-amber-950/60 border border-amber-600/50 rounded-xl p-3 mb-6 text-amber-200 text-sm font-medium">
            Jetonlar veya süre bittiği için kelimeyi bulamadınız. Kazanmak için kurt adamı bulun.
          </div>

          <div className="text-7xl font-mono font-black text-yellow-400 mb-6">{timeLeft}</div>
          <button onClick={() => setTimeLeft(0)} className="text-slate-400 underline hover:text-white transition-colors text-sm">Süreyi Atla ve Oylamaya Geç</button>
        </div>
      )}

      {step === 'village_voting' && (
        <div className="w-full animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-4">Kimi Oyluyorsunuz?</h2>
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            {players.map(p => (
              <button 
                key={p.id} 
                onClick={() => setSelectedPlayers(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                className={`py-4 font-bold rounded-xl flex justify-center items-center gap-2 border-2 transition-all ${
                  selectedPlayers.includes(p.id) 
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {p.name} {selectedPlayers.includes(p.id) && <CheckCircle2 size={20} />}
              </button>
            ))}
          </div>
          <button onClick={handleVillageVoteSubmit} disabled={selectedPlayers.length === 0} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-xl rounded-xl transition-all">
            Sonucu Onayla
          </button>
        </div>
      )}

      {step === 'result' && (
        <div className="w-full animate-fade-in">
          {winner === 'village' ? (
            <div className="bg-emerald-900/50 border border-emerald-500 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <ShieldCheck size={64} className="text-emerald-400 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-emerald-400">KÖY KAZANDI!</h2>
            </div>
          ) : (
            <div className="bg-red-900/50 border border-red-500 rounded-2xl p-6 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <Skull size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-4xl font-black text-red-500">KURT ADAM KAZANDI!</h2>
            </div>
          )}
          
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6">
            <span className="text-slate-400 block mb-1">Sihirli Kelime:</span>
            <span className="text-2xl font-bold text-white">{magicWord || "Bulunamadı"}</span>
          </div>

          <div className="bg-indigo-950/50 border border-indigo-500/30 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center justify-center gap-2">
              <Target size={20} />
              {dayEndReason === 'word_guessed' ? "Kurt Adamların Hedefi:" : "Köyün Oylarıyla Asılanlar:"}
            </h3>
            
            <div className="flex flex-col gap-2">
              {dayEndReason === 'word_guessed' ? (
                wwSelectedPlayers.length > 0 ? (
                  wwSelectedPlayers.map(id => {
                    const p = players.find(player => player.id === id);
                    return (
                      <div key={id} className="bg-indigo-900/50 py-2 px-4 rounded-lg flex justify-between items-center border border-indigo-700/50">
                        <span className="font-bold text-white text-lg">{p.name}</span>
                        <span className={`text-sm font-black tracking-wider ${p.secretRole === 'seer' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          ({roleNames[p.secretRole]})
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 italic py-2">Süre doldu, hedef seçilemedi.</div>
                )
              ) : (
                selectedPlayers.length > 0 ? (
                  selectedPlayers.map(id => {
                    const p = players.find(player => player.id === id);
                    return (
                      <div key={id} className="bg-indigo-900/50 py-2 px-4 rounded-lg flex justify-between items-center border border-indigo-700/50">
                        <span className="font-bold text-white text-lg">{p.name}</span>
                        <span className={`text-sm font-black tracking-wider ${p.secretRole === 'werewolf' ? 'text-red-400' : 'text-slate-400'}`}>
                          ({roleNames[p.secretRole]})
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-slate-400 italic py-2">Hiç kimse asılmadı.</div>
                )
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">Tüm Oyuncu Rolleri</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
            {players.map(p => (
              <li key={p.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center border border-slate-600/50">
                <span className="font-bold text-white">{p.name} {p.isMayor && "👑"}</span>
                <span className={`px-2 py-1 rounded text-sm font-bold ${
                  p.secretRole === 'werewolf' ? 'bg-red-900/80 text-red-300' :
                  p.secretRole === 'seer' ? 'bg-blue-900/80 text-blue-300' :
                  'bg-slate-600 text-slate-300'
                }`}>
                  {roleNames[p.secretRole]}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-4 w-full mt-6">
            <button onClick={onQuickRestart} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <RotateCcw size={20} /> Yeniden Başlat
            </button>
            <button onClick={onGoToLobby} className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Users size={20} /> Ekle/Çıkar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}