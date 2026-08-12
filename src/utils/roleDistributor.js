export const distributeRoles = (playerNames, mayorName) => {
  if (!playerNames || playerNames.length < 3) {
    throw new Error("En az 3 oyuncu gereklidir.");
  }
  if (!mayorName) {
    throw new Error("Lütfen bir Başkan seçin.");
  }

  const playerCount = playerNames.length;
  let secretRoles = ['seer']; // 1 Falcı garanti

  // 6. Madde: Dinamik Kurt Adam Sayısı
  let werewolfCount = 1;
  if (playerCount >= 12) werewolfCount = 3;
  else if (playerCount >= 7) werewolfCount = 2;

  for (let i = 0; i < werewolfCount; i++) {
    secretRoles.push('werewolf');
  }

  // Kalanlar Köylü
  while (secretRoles.length < playerCount) {
    secretRoles.push('villager');
  }

  // Rolleri Karıştır
  for (let i = secretRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [secretRoles[i], secretRoles[j]] = [secretRoles[j], secretRoles[i]];
  }

  return playerNames.map((name, index) => ({
    id: `player-${index}`,
    name: name.trim(),
    secretRole: secretRoles[index], 
    isMayor: name.trim() === mayorName
  }));
};