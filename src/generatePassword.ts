export function generatePassword(length: number): string {
  // TODO: skip error checking; UI SHOULD never allow this.
  if (length < 8) {
    throw new Error("Password length must be at least 8");
  }

  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";
  const symbols = "!@$%^&*()_+=<>/?";

  // 1. Generate Base Password (VCV pattern)
  let passwordArray: string[] = [];
  for (let i = 0; i < length; i++) {
    // Even indices: Vowel, Odd indices: Consonant
    if (i % 2 === 0) {
      passwordArray.push(vowels[Math.floor(Math.random() * vowels.length)]);
    } else {
      passwordArray.push(consonants[Math.floor(Math.random() * consonants.length)]);
    }
  }

  // 2. Randomly make one character uppercase
  const upperIdx = Math.floor(Math.random() * length);
  passwordArray[upperIdx] = passwordArray[upperIdx].toUpperCase();

  // Helper to get random index excluding a set of indices
  const getRandomIndex = (excluded: Set<number>, max: number, min: number = 0): number => {
    let candidate = -1;
    // Simple safeguard against infinite loop if too constrained
    let attempts = 0;
    while (attempts < 100) {
      candidate = Math.floor(Math.random() * (max - min)) + min;
      if (!excluded.has(candidate)) {
        return candidate;
      }
      attempts++;
    }
    // Fallback: just find first available
    for (let i = min; i < max; i++) {
      if (!excluded.has(i)) return i;
    }
    return min; // Should not happen given length >= 8
  };

  const occupiedIndices = new Set<number>();
  // We treat '0' as occupied for Symbol/Number because "Must begin with a letter"
  // So valid range for replacements is [1, length)

  // Protect upperIdx if it falls within the replacement range [1, length)
  if (upperIdx > 0) {
    occupiedIndices.add(upperIdx);
  }

  // 3. Randomly replace a character with a symbol
  // Exclude index 0
  const symbolIdx = getRandomIndex(occupiedIndices, length, 1);
  passwordArray[symbolIdx] = symbols[Math.floor(Math.random() * symbols.length)];
  occupiedIndices.add(symbolIdx);

  // 4. Generate a number from 0 to 99
  const num = Math.floor(Math.random() * 100);
  const numStr = num.toString();

  if (numStr.length === 1) {
    // 1 digit: Replace 1 random character
    // Exclude index 0 and existing symbol
    const numIdx = getRandomIndex(occupiedIndices, length, 1);
    passwordArray[numIdx] = numStr;
    occupiedIndices.add(numIdx);
  } else {
    // 2 digits: Replace 1 character and the following one
    // We need to find a slot of size 2.
    // Potential starts: 1 to length - 2
    const possibleStarts = [];
    for (let i = 1; i < length - 1; i++) {
      if (!occupiedIndices.has(i) && !occupiedIndices.has(i + 1)) {
        possibleStarts.push(i);
      }
    }

    if (possibleStarts.length > 0) {
      const numIdx = possibleStarts[Math.floor(Math.random() * possibleStarts.length)];
      passwordArray[numIdx] = numStr[0];
      passwordArray[numIdx + 1] = numStr[1];
      occupiedIndices.add(numIdx);
      occupiedIndices.add(numIdx + 1);
    } else {
      // Fallback: If we can't find clear slot (unlikely with length 8), overwrite something but preserve index 0.
      const fallbackIdx = Math.floor(Math.random() * (length - 2)) + 1; // 1 to length-2
      passwordArray[fallbackIdx] = numStr[0];
      passwordArray[fallbackIdx + 1] = numStr[1];
    }
  }

  return passwordArray.join('');
}
