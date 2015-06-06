
// Documentation sourced from
// http://devernay.free.fr/hacks/chip8/C8TECH10.HTM

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

function CPU(rom) {

  this.clockSpeed = 100; // Hz
  this.romBase    = 0x200;

  this.reset();

  rom && this.load(rom);

};

CPU.prototype.reset = function() {

  this.registers = {
    V:  new Array(16),
    I:  0,
    DT: 0,
    ST: 0
  };

  this.PC = this.romBase;

  this.stack  = [];
  this.memory = new Array(4096);

  for(var i = 0; i < fontSet.length; i++) {
    this.memory[i] = fontSet[i];
  }

};

CPU.prototype.load = function(rom) {
  rom.forEach((d, i) => this.memory[this.romBase + i] = d);
};

CPU.prototype.readNext = function() {
  return this.memory[this.PC++];
};

CPU.prototype.step = function() {

  // operations are 2 bytes
  let op = (this.readNext() << 8) + this.readNext();

  if(!op) {
    return;
  }

  // MSB is the opcode
  let opcode = op & 0xF000;

  let x   = (op & 0x0F00) >> 8;
  let y   = (op & 0x00F0) >> 4;
  let n   = (op & 0x000F);
  let kk  = (op & 0x00FF);
  let nnn = (op & 0x0FFF);

  let vx = this.registers.V[x];
  let vy = this.registers.V[y];

  switch(opcode) {

    case 0x0000: {

      switch(kk) {

        case 0x00E0: {

          // CLS
          this.display.clear();
          break;

        }

        case 0x00EE: {

          // Return from a subroute, set PC to top of stack.
          this.PC = this.stack.pop();
          break;

        }

      }

      break;

    }

    case 0x1000: {

      // 1nnn
      // JMP to nnn

      this.PC = nnn;
      break;

    }

    case 0x2000: {

      // 2nnn
      // Push current location to stack
      // and call a subroute at nnn

      this.stack.push(this.PC);

      if(this.stack.length > 16) {
        throw new Error("Stack length is over 16, aborting.");
      }

      this.PC = nnn;
      break;

    }

    case 0x3000: {

      // 3xkk
      // skip next instruction if Vx == kk

      if(vx === kk) {
        this.PC += 2;
      }

      break;

    }

    case 0x4000: {

      // 4xkk
      // skip next instruction if Vx != kk

      if(vx !== kk) {
        this.PC += 2;
      }

      break;

    }

    case 0x5000: {

      // 5xy0
      // skip next instruction if Vx == Vy

      if(vx == vy) {
        this.PC += 2;
      }

      break;

    }

    case 0x6000: {

      // 6xkk
      // Load value kk into Vx

      this.registers.V[x] = kk;
      break;

    }

    case 0x7000: {

      // 7xkk
      // Add value kk to Vx

      this.registers.V[x] += kk;
      break;

    }

    case 0x8000: {

      // 8xyn
      // see switch statement for values of n

      switch(n) {

        case 0x0000: {

          // 8xy0
          // Sets register Vx to value of Vy
          this.registers.V[x] = this.registers.V[y];
          break;

        }

        case 0x0001: {

          // 8xy1
          // OR Vx and Vy
          this.registers.V[x] |= this.registers.V[y];
          break;

        }

        case 0x0002: {

          // 8xy2
          // AND Vx and Vy
          this.registers.V[x] &= this.registers.V[y];
          break;

        }

        case 0x0003: {

          // 8xy3
          // XOR Vx and Vy
          this.registers.V[x] ^= this.registers.V[y];
          break;

        }

        case 0x0004: {

          // 8xy4
          // Add Vx and Vy, if the result is greater than 255
          // set the VF flag, only keep the lowest 8 bits.
          let v = this.registers.V[x] + this.registers.V[y];
          this.registers.V[0xF] = (v > 0xFF) ? 1 : 0;
          this.registers.V[x] = v & 0xFF;
          break;

        }

        case 0x0005: {

          // 8xy5
          // If Vx > Vy set VF flag, then subtract
          // Vy from Vx and store the result in Vx.
          let Vx = this.registers.V[x];
          let Vy = this.registers.V[y];
          this.registers.V[0xF] = (Vx > Vy) ? 1 : 0;
          this.registers.V[x] = Vx - Vy;
          break;

        }

        case 0x0006: {

          // 8xy6
          // If LSB of Vx is 1, set VF to 1 otherwise 0.
          // Then divide Vx by 2.
          this.registers.V[0xF] = this.registers.V[x] & 0x1;
          this.registers.V[x] >>= 1;
          break;

        }

        case 0x0007: {

          // 8xy7
          // If Vx > Vy set VF flag, then subtract
          // Vx from Vy and store the result in Vx.
          let Vx = this.registers.V[x];
          let Vy = this.registers.V[y];
          this.registers.V[0xF] = Vy > Vx;
          this.registers.V[x] = Vy - Vx;
          break;

        }

        case 0x000E: {

          // 8xyE
          // If MSB of Vx is 1, set VF
          // then multiply Vx by 2.
          this.registers.V[0xF] = ((vx & 0x80) === 0x80) ? 1 : 0;
          this.registers.V[x] = (vx << 1) & 0xFF;
          break;

        }

      }

      break;

    }

    case 0x9000: {

      // 9xy0
      // Skip next instruction if Vx != Vy
      if(vx != vy) {
        this.PC += 2;
      }

    }

    case 0xA000: {

      // Annn
      // Set I to nnn

      this.registers.I = nnn;
      break;

    }

    case 0xB000: {

      // Bnnn
      // PC is set to nnn + V0
      this.PC = nnn + this.registers.V[0];
      break;

    }

    case 0xC000: {

      // Cxkk
      // Generate a random byte between 0 and 0xFF
      // AND with kk, then store result in Vx.
      this.registers.V[x] = this.rng() & (op & 0x00FF);
      break;

    }

    case 0xD000: {

      // Dxyn - DRW at Vx, Vy the n sprite bytes stored in I

      let sprite = [];
      while(--n >= 0) {
        sprite.unshift(this.memory[this.registers.I + n]);
      }
      this.registers.V[0xF] = this.display.draw(vx, vy, sprite);
      break;

    }

    case 0xE000: {

      // Exnn
      // See switch for values of nn

      // TODO: input logic

      switch(kk) {
        case 0x009E: {

          // Ex9E
          // If key with value x is pressed
          // skip next instruction

          // TODO
          break;

        }
        case 0x00A1: {

          // ExA1
          // If key with value x is not pressed
          // skip next instruction

          // TODO
          break;

        }
      }
      break;

    }

    case 0xF000: {

      // Fxnn
      // See switch for values of nn

      switch(kk) {

        case 0x0007: {

          // Fx07
          // Set Vx to DT

          this.registers.V[x] = this.registers.DT;
          break;

        }

        case 0x000A: {

          // Fx0A
          // Block until key press
          // store in Vx

          this.stop();
          // TODO: block until input
          this.run();

          break;

        }

        case 0x0015: {

          // Fx15
          // Set DT to Vx

          this.registers.DT = this.registers.V[x];
          break;

        }

        case 0x0018: {

          // Fx18
          // Set ST to Vx
          this.registers.ST = this.registers.V[x];
          break;

        }

        case 0x001E: {

          // Fx1E
          // Add Vx to I
          this.registers.I += this.registers.V[x];
          break;

        }

        case 0x0029: {

          // Fx29
          // Set I to location of sprite for
          // digit Vx
          this.registers.I = (this.registers.V[x] * 5);

          break;

        }

        case 0x0033: {

          // Fx33
          // Get value from Vx, store each digit in I, I+1 & I+2
          this.memory[this.registers.I    ] = (vx & 0xF00) >> 8;
          this.memory[this.registers.I + 1] = (vx & 0x0F0) >> 4;
          this.memory[this.registers.I + 2] = (vx & 0x00F);
          break;

        }

        case 0x0055: {

          // Fx55
          // Store registers V0 -> Vx into memory starting at I
          for(let i = 0; i < x; i++) {
            this.memory[this.registers.I + i] = this.registers.V[i];
          }
          break;

        }

        case 0x0065: {

          // Fx65
          // Store memory starting at I into registers V0 -> Vx
          for(let i = 0; i < x; i++) {
            this.registers.V[i] = this.memory[this.registers.I + i];
          }
          break;

        }

      }

      break;

    }

    default: {
      console.error("Unknown op:" + op);
    }

  }

};

CPU.prototype.rng = function() {
  return Math.floor(Math.random() * 0x100);
};

CPU.prototype.run = function() {

  let frame = 1000 / this.clockSpeed;

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

};

CPU.prototype.stop = function() {
  clearTimeout(this.cpuTimer);
  clearTimeout(this.delayTimer);
  clearTimeout(this.soundTimer);
};

export default CPU;
