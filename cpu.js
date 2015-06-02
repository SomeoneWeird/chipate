
const fontSet = [
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];

function CPU() {

  this.speed = 100;

  this.fontBase = 0x080;
  this.romBase  = 0x200;

  this.registers = {
    V:  new Array(16),
    I:  0
    VF: 0,
    DT: 0,
    ST: 0
  };

  this.PC = this.romBase;

  this.memory = [];
  this.stack  = [];

  this.reset();

}

CPU.prototype.reset = function() {
  this.registers.V = new Array(16);
  this.registers.I = 0;
  this.registers.VF = 0;
  this.registers.DT = 0;
  this.registers.ST = 0;
  this.PC = this.romBase;
  this.stack = [];
  this.memory = [];

  // load font into memory
  for(var i = 0; i < this.fontBase; i++) {
    this.memory[i] = fontSet[i];
  }

}

CPU.prototype.load = function(rom) {
  rom.forEach((d, i) => this.memory[this.romBase + i] = d);
}

CPU.prototype.readNext() {
  return this.memory[this.PC++];
}

CPU.prototype.step = function() {

  // operations are 2 bytes 
  let op = this.readNext() + this.readNext();

  let opcode = op & 0xF000;

  switch(opcode) {

    case 0x0000: {

      if(op === 0x00E0) {
        // TODO: clear display
      } else if(op === 0x00EE) {
        this.PC = this.stack.pop();
      }

      break;

    }

    case 0x1000: {

      this.PC = op & 0xFFF;
      break;

    }

    case 0x2000: {

      this.stack.push(this.PC);
      this.PC = op & 0xFFF;
      break;

    }

    case 0x3000: {

      if(this.registers.V[op & 0x0F00] === op & 0x00FF) {
        this.PC += 2;
      }

      break;

    }

    case 0x4000: {

      if(this.registers.V[op & 0x0F00] !== op & 0x00FF) {
        this.PC += 2;
      }

      break;

    }

    case 0x5000: {

      if(this.registers.V[op & 0x0F00] == this.registers.V[op & 0x00F0]) {
        this.PC += 2;
      }

      break;

    }

    case 0x6000: {

      this.registers.V[op & 0x0F00] = op & 0x00FF;
      break;

    }

    case 0x7000: {

      this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] + op & 0x00FF;
      break;

    }

    case 0x8000: {

      let bit = op & 0x000F;

      switch(bit) {

        case 0x0000: {
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0001: {
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] | this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0002: {
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] & this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0003: {
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] ^ this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0004: {
          let v = this.registers.V[op & 0x0F00] + this.registers.V[op & 0x00F0];
          this.registers.VF = v > 0xFF ? 1 : 0;
          this.registers.V[op & 0x0F00] = v & 0xFF;
          break;
        }

        case 0x0005: {
          let x = this.registers.V[op & 0x0F00];
          let y = this.registers.V[op & 0x00F0];
          this.registers.VF = x > y;
          this.registers.V[op & 0x0F00] = x - y;
          break;
        }

        case 0x0006: {
          // unsure if this is correct TODO
          let bit = this.registers.V[op & 0x0F00] & 0x0F;
          this.registers.VF = bit === 1 ? 1 : 0;
          this.registers.V[op & 0x0F00] /= 2;
          break;
        }

        case 0x0007: {
          let x = this.registers.V[op & 0x0F00];
          let y = this.registers.V[op & 0x00F0];
          this.registers.VF = y > x;
          this.registers.V[0x0F00] = y - x;
          break;
        }

        case 0x000E: {
          // unsure if this is correct TODO
          let bit = this.registers.V[op & 0x0F00] & 0xF0;
          this.registers.VF = bit === 1 ? 1 : 0;
          this.registers.V[op & 0x0F00] *= 2;
          break;
        }

      }

      break;

    }

    case 0xA000: {

      this.registers.I = op & 0x0FFF;
      break;

    }

    case 0xB000: {

      this.SP = (op & 0x0FFF) + this.registers.V[0];
      break;

    }

    case 0xC000: {

      this.registers.V[0x0F00] = Math.floor(Math.random()*0x100) & (op & 0x0FF);
      break;

    }

    case 0xD000: {

      // TODO: display collision logic
      break;

    }

    case 0xE000: {

      // TODO: input logic
      let bits = op & 0x00FF;

      switch(bits) {
        case 0x009E: {
          // TODO
          break;
        }
        case 0x00A1: {
          // TODO
          break;
        }
      }
      break;

    }

    case 0xF000: {

      let bits = op & 0x00FF;

      switch(bits) {

        case 0x0007: {
          // TODO
          break;
        }

        case 0x000A: {

          this.stop();
          // TODO: block until input
          this.run();

          break;
        }

        case 0x0015: {
          // TODO
          break;
        }

        case 0x0018: {
          // TODO
          break;
        }

        case 0x001E: {
          this.registers.I += this.registers.V[op & 0x0F00];
          break;
        }

        case 0x0029: {
          // TODO
          break;
        }

        case 0x0033: {
          let v = this.registers.V[op & 0x0F00];
          this.memory[this.registers.I    ] = v & 0x0F00;
          this.memory[this.registers.I + 1] = v & 0x00F0;
          this.memory[this.registers.I + 2] = v & 0x000F;
          break;
        }

        case 0x0055: {
          let n = op & 0x0F00;
          for(let i = 0; i < n; i++) {
            this.memory[this.registers.I + i] = this.registers.V[i]
          }
          break;
        }

        case 0x0065: {
          let n = op & 0x0F00;
          for(let i = 0; i < n; i++) {
            this.registers.V[i] = this.memory[this.registers.I + i];
          }
          break;
        }

      }

    }

    default: {
      console.error("Unknown op:" + op);
    }

  }

}

CPU.prototype.run = function() {

  let frame = 1000 / this.speed;

  this.cpuTimer = setInterval(() => this.step(), frame);

  this.delayTimer = setInterval(() => {
    if(this.registers.DT)
      this.registers.DT--;
  }, frame);

  this.soundTimer = setInterval(() => {
    if(this.registers.ST) {
      // play sound
      this.registers.ST--;
    }
  }, frame);

}

CPU.prototype.stop = function() {
  clearTimeout(this.cpuTimer);
  clearTimeout(this.delayTimer);
  clearTimeout(this.soundTimer);
}
