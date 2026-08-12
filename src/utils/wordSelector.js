export const selectWordsForMayor = (wordsData, mayorSecretRole) => {
  const selectedWords = [];

  const getRandomUniqueWord = (poolCategory) => {
    const pool = wordsData[poolCategory];
    const availableWords = pool.filter(word => !selectedWords.includes(word));
    
    if (availableWords.length === 0) return pool[Math.floor(Math.random() * pool.length)];
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  };

  // 3 kelime seçimi
  for (let i = 0; i < 3; i++) {
    let chosenCategory = 'orta';

    if (mayorSecretRole === 'seer') {
      // Falcı Başkan: %50 Kolay, %50 Orta
      chosenCategory = Math.random() < 0.5 ? 'kolay' : 'orta';
    } else if (mayorSecretRole === 'werewolf') {
      // Kurt Adam Başkan: %50 Zor, %50 Orta
      chosenCategory = Math.random() < 0.5 ? 'zor' : 'orta';
    }

    selectedWords.push(getRandomUniqueWord(chosenCategory));
  }

  return selectedWords;
};