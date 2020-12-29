// https://hunt.reaktor.com/android
const fs = require('fs')
const Jimp = require('jimp')

const makePNG = (grid) => {
  let image = new Jimp(128, 128, function (err, image) {
    if (err) throw err;
    grid.forEach((row, y) => {
      row.forEach((col, x) => {
        switch(grid[x][y]) {
          case 'L':
          image.setPixelColor(0xffffffff, x, y);
          break;
          case 'R':
          image.setPixelColor(0xffffffff, x, y);
          break;
          case 'U':
          image.setPixelColor(0xffffffff, x, y);
          break;
          case 'D':
          image.setPixelColor(0xffffffff, x, y);
          break;
          case 'S':
          image.setPixelColor(0xFF00FFFF, x, y);
          break;
          case 'F':
          image.setPixelColor(0x228B22ff, x, y);
          break;
          case 'X':
          image.setPixelColor(0xFF0000ff, x, y);
          break;
          case 'P':
          image.setPixelColor(0x87CEFAFF, x, y);
          break;
          default: 
          image.setPixelColor(0x000000FF, x, y);
        }
      });
    });

    image.write('img.png', (err) => {
      if (err) throw err;
    });
  });
}

// a graph node representing neuron
class Gnode {
  constructor(dir, x, y) {
    this.dir = dir;
    this.x = x;
    this.y = y;
    this.next = [];
    this.prev = [];
    this.nearNodes = [];
    this.visited = false;
  }
}

// which way did we move from node1 to node2
const whichDirection = (node1, node2) => {
  if (node1.x === node2.x) {
    if (node1.y > node2.y) return 'U';
    else return 'D';
  } else {
    if (node1.x > node2.x) return 'L';
    else return 'R';
  }
}

const findNeuralPath = (data) => {
  const lines = data.split('\n');
  let leGraph = {} // all neural nodes will be saved here

  // populate leGraph with direct paths
  lines.forEach(line => {
    const [start, dirStr] = line.split(' ');
    let [x, y] = start.split(',').map(el => parseInt(el))
    let directions = [];
    if (dirStr) directions = dirStr.split(',')

    for (let i = 0; i < directions.length - 1; i++) {
      let coord = `${x},${y}`;
      if (!leGraph[coord]) leGraph[coord] = new Gnode(directions[i], x, y)
      let curr = leGraph[coord];
      if (directions[i] === 'L') x--;
      if (directions[i] === 'R') x++;
      if (directions[i] === 'U') y--;
      if (directions[i] === 'D') y++;
      let newCoord = `${x},${y}`
      if (!leGraph[newCoord]) leGraph[newCoord] = new Gnode(directions[i + 1], x, y);
      let next = leGraph[newCoord];
      next.prev = [...next.prev, curr];
      curr.next = [...curr.next, next];
    } // end for loop
  }) 

  // link near neighbors
  for (let key in leGraph) {
    const node = leGraph[key];
    const x = node.x;
    const y = node.y;
    const neighbors = [`${x + 1},${y}`,`${x - 1},${y}`,`${x},${y + 1}`,`${x},${y - 1}`];
    neighbors.forEach(nei => {
      let neiNode = leGraph[nei];
      if (neiNode && !node.prev.includes(neiNode) && !node.next.includes(neiNode))
        node.nearNodes.push(neiNode)
    })
  }

  let coo = '2,2'; // coordinates of Start
  let dirStack = []; // directions of neural path
  let nd = leGraph[coo];
  let nodeStack = [nd]; // nodes in the path

  const choose = (arr, nd) => {
    if (arr) {
      for (let x = 0; x < arr.length; x++) {
        if (!arr[x].visited && arr[x].dir !== 'X') {
          nodeStack.push(arr[x]);
          dirStack.push(whichDirection(nd, arr[x]))
          arr[x].visited = true;
          return arr[x];
        }
      }
    }
    return null;
  }

  let prev, next, near;
  while (nodeStack.length && nodeStack[nodeStack.length - 1].dir !== 'F') {
    let current = nodeStack[nodeStack.length - 1];
    prev = choose(current.prev, current)
    if (!prev) {
      next = choose(current.next, current)
      if (!next) {
        near = choose(current.nearNodes, current)
        if (!near) {
          // nowhere to go, we backtrack
          nodeStack.pop();
          dirStack.pop();
        } 
      } 
    } 
  } 
 
  console.log(dirStack.join(''))
/* prints answer:

DDDDRDDDRURRRDRRRDRRRRRRRRRRURDRURRUUUULDLDLLDLDLLUULDLDLULLULLURUR
URRRRRUURRDRURRRDRURRRRRRRRRRRRRRRRDDRRDLDRDRUUUULLURRRRDLDDDRURRDR
RRRDDDLLDDLLDLLLDDRDDRRUURRURDRDDLDRDDDLULLDLDRDLDDDDLULLLLLLLLDDLL
LLDLLURUULLLULLLDDDDDDDDRURDDLLDDDLLDRDRDRURUUURRRDDLDLDDLLLLULULUU
URRULLLLLLDLLLLLLLLULLLLLDRDRURRDRRDLDRDDDDDRDDDRURDRRRRRRDLLLLLLLL
LULLLULULURRRUUULLDLLLLULDDDRRDDDRDLLULULULUUUUUUUUURRDDDRURUULULLL
LDDDDDDDDDDDRDDDDDDDDDDDLDDDRUURDRDDDDDRDRUUURULUURUURRURRRRRDRDDDR
DLDDRRRRDRURDDRRRUUURRRURRRDRURDRRURRRRDRRRRRRRURRDRRRURDRURDRURRDD
LDLDDDRURRRDDDLLLLLDDLLUULLDDLLLUULLDDLLULDLLUULLDDLLLUULLDDDRDLDDD
DLDLDDRRDDDDRURRRRRRRRDRDDDDLLDLLLDDLULDLLULDLLULLLDDRDLLUUUULLLDDR
DDLDDLLDLLULUURUUULLLUULLLLDDDDDDRDDDRRDDLLDRDRDRDDDRRDDDLLLLLDDDRR
DDDLULDLLUUUULDLLDDLDDLDDLULLLDDRDRRDRRURURRRRDRDRURURRRDLDDLDRDDRR
RRDRURRDDRDRRRRUURRUURRUUUUUUUURURRDDRDRURRRRDRDDDDDDDDDRRURDRURRRR
UURRRRDDRRRUULURRRRDRRRRRRRRRUULURURULLLUURRDRURRDDRDLDDLDRDRRDRRUU
RRURURDDRRDDDDRRUUUUUULUULURURRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRDRRUR
UULUURRUULURUUULUULLLUUUURRDDRRUUUULUUULLUUULLDLLLLLLULDLLULLLLUURU
RUULLULLLLLLLLDDDLLLDDDLDRRDLDLDLUUUUUUUUURRDRUUULUURRRRRRRURUURRRD
DDRRUUUUUUUUULLULDDDDRDLLLLLDLDLULDDLLULDLLULDDLDRRDDLLDDLLULURULLU
LULDDLDDDLLULURULLUULLLLLDLLDLLUUUUULURRRRUULURULLULLULLUURRRUURRDD
RDDRUUURUUUURRRDRDRDRDRUUUULULUURRUUUURRRUULLLUURULULLULLLDDRDLDDRR
DDLDDLDDDLUUUULUUUUUULLLLLLLLLLLUUUUUUURRDLDDRRDRRRRUUURRRRURRRDLDR
DRRDRRUURURRDDDLDRDDDRRDDDDDLDRDDDLDDLDDDDRRUURRRDDRRURDRRRULULUUUU
RRRRRDRRDRURRURURRURRURRRDRRDRDRRUUULULLUUUURRDDRRUURRRRUURRUUULLUU
LUURUURULURUULURUULURRDRDRRUULLULLULLDLUULLDLUULLLDLDLLULULLULLLLLL
LLDRRRDDLLLLDLLLUULLDDLLLURULUURRRUUULULULLLLDLULLDDDRRDDRRDDDDLLLU
ULULLLLLLULLLLLLLLLLLDDDRDDRRULUUURDRRURRDRRDRRDRRRRDDLDLLULDLLLDLD
DRRDLDLLLUULLLDRDLDLLLLLLUUUUUUURDDDRDLDDRRRUUURUULLUUULLUUURULURUL
UUUULUULLURULUULURUUULLLULLDDDRDDRDLDLUUULUUUUURURDRRDRRRDDDDDDRDDR
DRUURUUULDLLUUURRULULULLLULLULLURURURRRRDDDRRRRRRURRRRRRRULUUULLDDL
ULLURRURRRRDDRUUUURURDRRRRRRRRDLDDRRRDRDDLDRDDRURURRRDRRRDLDDLLLLLL
LLDDLUULULDLDDRDLDDDDDRRRULUURURRUURRDRRDDRRRURRRRDLDRDDRRRRUULURURURU
*/

  /* make PNG illustration  */
  let grid = new Array(128).fill('x').map(el => new Array(128).fill('.'));
  for (let m = 0; m < grid.length; m++) {
    for (let n = 0; n < grid.length; n++) {
      if (leGraph[`${m},${n}`]) grid[m][n] = leGraph[`${m},${n}`].dir;
    }
  }
  nodeStack.forEach(el => { // fill solution path
    if (grid[el.x][el.y] !== 'F' && grid[el.x][el.y] !== 'S')  grid[el.x][el.y] = 'P'
  })
  makePNG(grid);
}

try {
  const data = fs.readFileSync(`${__dirname}/data3.txt`, 'utf8')
  findNeuralPath(data);
} catch (err) {
  console.error(err)
}

