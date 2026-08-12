import { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Sun, Check, X, HelpCircle, Target, MinusCircle, FastForward } from 'lucide-react';

export default function DayPhaseScreen({ onComplete }) {
  const { players, tokens, playerTokens, giveToken, setDayEndReason, settings } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(settings.dayPhaseTime);
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0 || tokens.yesNo <= 0) {
      setIsEnded(true);
    }
  }, [timeLeft, tokens.yesNo]);

  useEffect(() => {
    if (timeLeft > 0 && !isEnded) {
      const timerId = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft, isEnded]);

  const handleCorrectGuess = (playerId) => {
    if (isEnded) return;
    setDayEndReason('word_guessed', playerId);
    onComplete();
  };

  const handleProceedToVote = () => {
    setDayEndReason('timeout');
    onComplete();
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <div className="w-full max-w-4xl bg-slate-800 p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6 bg-slate-900 p-4 rounded-xl border border-slate-700">
        <div className="flex items-center gap-3">
          <Sun size={32} className="text-yellow-400" />
          <div className="text-2xl font-black font-mono text-emerald-400">{formatTime(timeLeft)}</div>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-xs text-slate-400">EVET/HAYIR</div>
            <div className={`text-3xl font-black ${tokens.yesNo === 0 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{tokens.yesNo}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto w-full mb-6 rounded-xl border border-slate-700 custom-scrollbar">
        <table className="w-full text-sm text-center border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700 text-slate-300">
              <th className="p-4 text-left">Oyuncu</th>
              <th className="p-4"><Check size={18} className="inline"/> Evet</th>
              <th className="p-4"><X size={18} className="inline"/> Hayır</th>
              <th className="p-4"><HelpCircle size={18} className="inline"/> Belki</th>
              <th className="p-4"><Target size={18} className="inline"/> Çok Yakın</th>
              <th className="p-4"><MinusCircle size={18} className="inline"/> Çok Uzak</th>
              <th className="p-4">Kelime</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => {
              if (p.isMayor) return (
                <tr key={p.id} className="border-b border-slate-700 bg-slate-800/80">
                  <td className="p-4 font-bold text-left text-lg">{p.name}</td>
                  <td colSpan="6" className="p-4 text-yellow-500 font-black">👑 BAŞKAN</td>
                </tr>
              );
              const pt = playerTokens[p.id];
              return (
                <tr key={p.id} className="border-b border-slate-700">
                  <td className="p-4 font-bold text-left">{p.name}</td>
                  <td className="p-2">
                    <button 
                      onClick={() => giveToken(p.id, 'yes')} 
                      disabled={tokens.yesNo <= 0 || isEnded} 
                      className="p-2 text-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                    >
                      {pt.yes}×
                    </button>
                  </td>
                  <td className="p-2">
                    <button 
                      onClick={() => giveToken(p.id, 'no')} 
                      disabled={tokens.yesNo <= 0 || isEnded} 
                      className="p-2 text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                    >
                      {pt.no}×
                    </button>
                  </td>
                  <td className="p-2">
                    <button 
                      onClick={() => giveToken(p.id, 'maybe')} 
                      disabled={tokens.maybe <= 0 || isEnded} 
                      className="p-2 text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                    >
                      {pt.maybe}×
                    </button>
                  </td>
                  <td className="p-2 text-center">
                    {pt.soClose ? "🎯" : (
                      <button 
                        onClick={() => giveToken(p.id, 'soClose')} 
                        disabled={tokens.soClose <= 0 || isEnded} 
                        className="text-indigo-400 text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                        VER
                      </button>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    {pt.wayWayOff ? "⛔" : (
                      <button 
                        onClick={() => giveToken(p.id, 'wayWayOff')} 
                        disabled={tokens.wayWayOff <= 0 || isEnded} 
                        className="text-rose-400 text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                      >
                        VER
                      </button>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <button 
                      onClick={() => handleCorrectGuess(p.id)} 
                      disabled={isEnded}
                      className="bg-white hover:bg-emerald-400 text-slate-900 font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      BİLDİ! ✅
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isEnded && (
        <div className="mb-4 flex justify-center animate-bounce">
          <button
            onClick={handleProceedToVote}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg border border-red-400 transition-all flex items-center gap-2 text-sm"
          >
            ⚠️ Jetonlar veya Süre Bitti - Oylamaya Geç
          </button>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleProceedToVote}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          <FastForward size={14} /> Süreyi Manuel Bitir / Oylamaya Geç
        </button>
      </div>
    </div>
  );
}