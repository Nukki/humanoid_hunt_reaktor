/* https://hunt.reaktor.com/nanobots */
const fs = require('fs')

/* finds the key with the biggest value */
const getMaxKey = (obj) => {
  let max = 0;
  let maxKey = '';
  for (let key in obj) {
    if (obj[key] > max) {
      max = obj[key];
      maxKey = key;
    }
  }
  return maxKey;
}

const getBaseValue = (data) => {
  let base = '';
  const singleChars = data.split('');

  /* stats object with characters as keys, and frequency of that char in data as value */
  let stats = {};
  singleChars.forEach(char => {
    let curr = stats[char];
    if (curr) stats[char] = curr + 1
    else stats[char] = 1;
  })

  let boi = getMaxKey(stats); // most frequently used char in data
  while (boi !== ';') {
    base += boi;
    /*
      nextBoiStats object will contain frequency stats for 
      characters that go right after 'boi'.
      For example if 'boi' is 'a', we will be looking at 'ab', 'af', 'ax'..etc 
      and get the object with 'b', 'f', 'x' as keys, and their frequency after 'boi' as value
    */
    let nextBoiStats = {}  
    for (let i = 0; i < singleChars.length - 1; i++) {
      if (singleChars[i] == boi) {
        let nextBoi = singleChars[i + 1];
        let newStat = nextBoiStats[nextBoi];
        if (newStat) nextBoiStats[nextBoi] = newStat + 1;
        else nextBoiStats[nextBoi] = 1;
      }
    }
    boi = getMaxKey(nextBoiStats);
  }

  console.log(base); //prints 'PArietalLobE' <--- ANSWER 
}


try {
  const data = fs.readFileSync(`${__dirname}/data2.txt`, 'utf8')
  getBaseValue(data);
} catch (err) {
  console.error(err)
}