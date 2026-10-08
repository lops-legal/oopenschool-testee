import fs from 'fs';
import path from 'path';

// Read questions
const qData = JSON.parse(fs.readFileSync('questions_forma_a.json', 'utf8'));

// Read public/audios directory
const publicAudios = fs.readdirSync('public/audios');

console.log('Comparing questions audio files against public/audios/ directory:');
let missingCount = 0;

qData.forEach(q => {
  if (q.audioFile) {
    const exists = publicAudios.includes(q.audioFile);
    if (!exists) {
      console.warn(`❌ MISSING: "${q.audioFile}" (Question ID: ${q.id})`);
      // Check case-insensitive
      const matchCI = publicAudios.find(f => f.toLowerCase() === q.audioFile.toLowerCase());
      if (matchCI) {
        console.warn(`   ⚠️ Case mismatch! Found "${matchCI}" in filesystem vs "${q.audioFile}" in JSON.`);
      }
      missingCount++;
    } else {
      console.log(`✅ OK: "${q.audioFile}"`);
    }
  }
});

console.log(`Total checked: ${qData.length}, Missing / Case Mismatches: ${missingCount}`);
