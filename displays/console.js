
import Display from "./display";

const EMPTY_MEM_FUNC = function () { return (new Array(64*32+1)).join(0).split('').map(function(num) { return parseInt(num, 10); }); };

class ConsoleDisplay extends Display {

  constructor() {
    super();
    this.memory = EMPTY_MEM_FUNC();
    this._log = console.log;
  }

  _draw() {
    let n = -1;
    while(++n < 32) {
      let slice = this.memory.slice(n*64, n*64+64);
      this._log(slice.join(''));
    }
  }

  clear() {
    this.memory = EMPTY_MEM_FUNC();
    this._draw();
  }

  draw(x, y, sprite) {

    let redraw = false;

    for(let n = 0; n < sprite.length; n++) {
      for (let spriteBit = 0; spriteBit < 8; spriteBit++) {
        let nx = (x + spriteBit) % 64;
        let ny = (y + n) % 32;
        let memOffset = 64*(ny) + nx;
        let spriteValue = (sprite[n] & Math.pow(2, 7-spriteBit)) >> 7-spriteBit;
        redraw = redraw || (this.memory[memOffset] === 1 && spriteValue === 1);
        this.memory[memOffset] ^= spriteValue;
      }
    }

    this._draw();

    return redraw ? 1 : 0;

  }

};

export default ConsoleDisplay;
