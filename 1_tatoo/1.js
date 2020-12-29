/* https://hunt.reaktor.com/tattoo */
const fs = require('fs')


const findPassword = (data) => {
  let password = '';
  /*
  channels is an array of channel arrays.
  each channel array consists of bytes, where each byte is saved as Integer
  */
  let channels = data.split('\n').map(line => {
    const bytes = [];
    let i = 0;
    while (i < line.length - 7) {
      const num = parseInt(line.slice(i, i + 8), 2); // parse an 8-bit binary string into Int
      bytes.push(num);
      i += 8;
    }
    return bytes;
  });

  channels.forEach(chan => { // exctact password characters from each channel
    let x = 0;
    while (true) {
      if (chan[x] < chan.length) break; // found the first valid byte that will not cause overflow
      x++;
    }
    while (true) {
      if (chan[x] >= chan.length) break; // found the invalid byte that has a password char
      x = chan[x];
    }
    password += String.fromCharCode(chan[x]);
  })

  console.log(password) // prints 'left-ventricle'   <---- ANSWER
}


try {
  const data = fs.readFileSync(`${__dirname}/data1.txt`, 'utf8')
  findPassword(data);
} catch (err) {
  console.error(err)
}