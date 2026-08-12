import { create } from 'zustand';

export const useGameStore = create((set) => ({
  players: [],
  magicWord: "",
  tokens: { yesNo: 36, maybe: 12, soClose: 1, wayWayOff: 1 },
  playerTokens: {}, 
  dayEndReason: null,
  guesserId: null,

  settings: {
    dayPhaseTime: 300,
    werewolfTurnTime: 35,
    villageVoteTime: 70,
    nightViewTime: 5
  },

  setSettings: (newSettings) => set({ settings: { ...newSettings } }),
  
  setPlayers: (players) => {
    const initialPlayerTokens = {};
    players.forEach(p => {
      initialPlayerTokens[p.id] = { yes: 0, no: 0, maybe: 0, soClose: false, wayWayOff: false };
    });
    set({ players, playerTokens: initialPlayerTokens });
  },

  setMagicWord: (word) => set({ magicWord: word }),
  setDayEndReason: (reason, guesserId = null) => set({ dayEndReason: reason, guesserId }),

  giveToken: (playerId, tokenType) => set((state) => {
    const globalType = (tokenType === 'yes' || tokenType === 'no') ? 'yesNo' : tokenType;
    if (state.tokens[globalType] > 0) {
      const currentPlayerTokens = state.playerTokens[playerId];
      if (tokenType === 'soClose' || tokenType === 'wayWayOff') {
        if (currentPlayerTokens[tokenType]) return state; 
        return {
          tokens: { ...state.tokens, [globalType]: state.tokens[globalType] - 1 },
          playerTokens: { ...state.playerTokens, [playerId]: { ...currentPlayerTokens, [tokenType]: true } }
        };
      }
      return {
        tokens: { ...state.tokens, [globalType]: state.tokens[globalType] - 1 },
        playerTokens: { ...state.playerTokens, [playerId]: { ...currentPlayerTokens, [tokenType]: currentPlayerTokens[tokenType] + 1 } }
      };
    }
    return state;
  }),

  // Hızlı yeniden başlatma: Rolleri yeniden dağıtılmış oyuncuları alır, board'u sıfırlar.
  softResetGame: (newPlayers) => {
    const initialPlayerTokens = {};
    newPlayers.forEach(p => {
      initialPlayerTokens[p.id] = { yes: 0, no: 0, maybe: 0, soClose: false, wayWayOff: false };
    });
    set({
      players: newPlayers,
      magicWord: "",
      tokens: { yesNo: 36, maybe: 12, soClose: 1, wayWayOff: 1 },
      playerTokens: initialPlayerTokens,
      dayEndReason: null,
      guesserId: null
    });
  },

  // Lobiye dönüş: Sadece oyun verisini temizler, oyuncular ve ayarlar kalır.
  resetForLobby: () => set({
    magicWord: "",
    tokens: { yesNo: 36, maybe: 12, soClose: 1, wayWayOff: 1 },
    playerTokens: {},
    dayEndReason: null,
    guesserId: null
  })
}));