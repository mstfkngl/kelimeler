import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { distributeRoles } from '../utils/roleDistributor';
import { Users, UserPlus, Play, Crown, Settings, Trash2 } from 'lucide-react';

export default function SetupScreen({ onComplete }) {
  const { players, setPlayers, settings, setSettings } = useGameStore();
  
  // Önceki oyun varsa listeyi ve başkanı oradan çek
  const [localPlayers, setLocalPlayers] = useState(() => players.map(p => p.name) || []);
  const [mayorName, setMayorName] = useState(() => players.find(p => p.isMayor)?.name || null);
  
  const [playerName, setPlayerName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    const name = playerName.trim();
    if (name && !localPlayers.includes(name)) {
      setLocalPlayers(prev => [...prev, name]);
      if (!mayorName) setMayorName(name); // İlk ekleneni varsayılan başkan yap
      setPlayerName('');
    }
  };

  const handleRemovePlayer = (nameToRemove) => {
    setLocalPlayers(prev => prev.filter(name => name !== nameToRemove));
    if (mayorName === nameToRemove) {
      setMayorName(null); // Silinen kişi başkansa başkanı sıfırla
    }
  };

  const handleStartGame = () => {
    try {
      const distributedPlayers = distributeRoles(localPlayers, mayorName);
      setPlayers(distributedPlayers);
      onComplete();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-indigo-400">
          <Users size={32} />
          <h1 className="text-2xl font-bold">Lobi</h1>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-slate-400 hover:text-white">
          <Settings size={28} />
        </button>
      </div>

      {showSettings ? (
        <div className="space-y-4 mb-6 bg-slate-900 p-4 rounded-xl border border-slate-700">
          <h3 className="font-bold text-white mb-2">Süre Ayarları (Saniye)</h3>
          {Object.keys(tempSettings).map((key) => (
            <div key={key} className="flex justify-between items-center text-sm">
              <span className="text-slate-300">
                {key === 'dayPhaseTime' ? 'Gündüz (Kelime Bulma)' : 
                 key === 'werewolfTurnTime' ? 'Kurt Adam Falcı Avı' :
                 key === 'villageVoteTime' ? 'Köy Tartışma/Oylama' : 'Gece Rol Gösterimi'}
              </span>
              <input 
                type="number" 
                value={tempSettings[key]}
                onChange={(e) => setTempSettings({...tempSettings, [key]: Number(e.target.value)})}
                className="w-20 bg-slate-700 text-white px-2 py-1 rounded outline-none"
              />
            </div>
          ))}
          <button 
            onClick={() => { setSettings(tempSettings); setShowSettings(false); }}
            className="w-full bg-indigo-600 py-2 rounded text-white font-bold mt-2"
          >
            Kaydet
          </button>
        </div>
      ) : (
        <>
          <form onSubmit={handleAddPlayer} className="flex gap-2 mb-6">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Oyuncu adı..."
              className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl outline-none"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 p-3 rounded-xl transition-colors">
              <UserPlus size={24} />
            </button>
          </form>

          <p className="text-xs text-slate-400 mb-2">Başkan yapmak istediğiniz kişinin yanındaki taca tıklayın.</p>
          <ul className="space-y-2 mb-8 max-h-60 overflow-y-auto custom-scrollbar pr-2">
            {localPlayers.map((player, idx) => (
              <li key={idx} className="bg-slate-700/50 px-4 py-3 rounded-lg flex items-center justify-between group">
                <span className="text-lg font-medium">{player}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setMayorName(player)}
                    className={`p-2 rounded-full transition-all ${mayorName === player ? 'bg-yellow-500/20 text-yellow-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Crown size={24} />
                  </button>
                  <button 
                    onClick={() => handleRemovePlayer(player)}
                    className="p-2 text-rose-500 opacity-50 hover:opacity-100 hover:bg-rose-500/20 rounded-full transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={handleStartGame}
            disabled={localPlayers.length < 3 || !mayorName}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white"
          >
            <Play size={24} /> Oyunu Başlat
          </button>
        </>
      )}
    </div>
  );
}