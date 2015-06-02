
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

function CPU() {

  this.clockSpeed = 100; // Hz
  this.fontBase   = 0x080;
  this.romBase    = 0x200;

  this.reset();

}

CPU.prototype.reset = function() {

  this.registers = {
    V:  new Array(16),
    I:  0,
    VF: 0,
    DT: 0,
    ST: 0
  };

  this.PC = this.romBase;

  this.stack  = new Array(16);
  this.memory = new Array(4096);

  for(var i = 0; i < fontSet.length; i++) {
    this.memory[this.fontBase + i] = fontSet[i];
  }

}

CPU.prototype.load = function(rom) {
  rom.forEach((d, i) => this.memory[this.romBase + i] = d);
}

CPU.prototype.readNext = function() {
  return this.memory[this.PC++];
}

CPU.prototype.step = function() {

  // operations are 2 bytes 
  let op = this.readNext() + this.readNext();

  // MSB is the opcode
  let opcode = op & 0xF000;

  switch(opcode) {

    case 0x0000: {

      let bits = op & 0x00FF;

      switch(bits) {

        case 0x00E0: {
          // CLS
          // TODO: clear display
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

      this.PC = op & 0xFFF;
      break;

    }

    case 0x2000: {

      // 2nnn
      // Push current location to stack
      // and call a subroute at nnn

      this.stack.push(this.PC);
      this.PC = op & 0xFFF;
      break;

    }

    case 0x3000: {

      // 3xkk
      // skip next instruction if Vx == kk

      if(this.registers.V[op & 0x0F00] === op & 0x00FF) {
        this.PC += 2;
      }

      break;

    }

    case 0x4000: {

      // 4xkk
      // skip next instruction if Vx != kk

      if(this.registers.V[op & 0x0F00] !== op & 0x00FF) {
        this.PC += 2;
      }

      break;

    }

    case 0x5000: {

      // 5xy0
      // skip next instruction if Vx == Vy

      if(this.registers.V[op & 0x0F00] == this.registers.V[op & 0x00F0]) {
        this.PC += 2;
      }

      break;

    }

    case 0x6000: {

      // 6xkk
      // Load value kk into Vx

      this.registers.V[op & 0x0F00] = op & 0x00FF;
      break;

    }

    case 0x7000: {

      // 7xkk
      // Add value kk to Vx

      this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] + op & 0x00FF;
      break;

    }

    case 0x8000: {

      // 8xyn
      // see switch statement for values of n

      let bit = op & 0x000F;

      switch(bit) {

        case 0x0000: {
          // 8xy0
          // Sets register Vx to value of Vy
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0001: {
          // 8xy1
          // OR Vx and Vy
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] | this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0002: {
          // 8xy2
          // AND Vx and Vy
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] & this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0003: {
          // 8xy3
          // XOR Vx and Vy
          this.registers.V[op & 0x0F00] = this.registers.V[op & 0x0F00] ^ this.registers.V[op & 0x00F0];
          break;
        }

        case 0x0004: {
          // 8xy4
          // Add Vx and Vy, if the result is greater than 255
          // set the VF flag, only keep the lowest 8 bits.
          let v = this.registers.V[op & 0x0F00] + this.registers.V[op & 0x00F0];
          this.registers.VF = v > 0xFF ? 1 : 0;
          this.registers.V[op & 0x0F00] = v & 0xFF;
          break;
        }

        case 0x0005: {
          // 8xy5
          // If Vx > Vy set VF flag, then subtract 
          // Vy from Vx and store the result in Vx.
          let x = this.registers.V[op & 0x0F00];
          let y = this.registers.V[op & 0x00F0];
          this.registers.VF = x > y;
          this.registers.V[op & 0x0F00] = x - y;
          break;
        }

        case 0x0006: {
          // 8xy6
          // If LSB of Vx is 1, set VF
          // then divide Vx by 2.

          // unsure if this is correct TODO
          let bit = this.registers.V[op & 0x0F00] & 0x0F;
          this.registers.VF = bit === 1 ? 1 : 0;
          this.registers.V[op & 0x0F00] /= 2;
          break;
        }

        case 0x0007: {
          // 8xy7
          // If Vx > Vy set VF flag, then subtract 
          // Vx from Vy and store the result in Vx.
          let x = this.registers.V[op & 0x0F00];
          let y = this.registers.V[op & 0x00F0];
          this.registers.VF = y > x;
          this.registers.V[0x0F00] = y - x;
          break;
        }

        case 0x000E: {
          // 8xyE
          // If MSB of Vx is 1, set VF
          // then multiply Vx by 2.

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

      // Annn
      // Set I to nnn

      this.registers.I = op & 0x0FFF;
      break;

    }

    case 0xB000: {

      // Bnnn
      // Jump to nnn + V0
      this.SP = (op & 0x0FFF) + this.registers.V[0];
      break;

    }

    case 0xC000: {

      // Cxkk
      // Generate a random byte between 0 and 0xFF
      // AND with kk, then store result in Vx.
      this.registers.V[0x0F00] = Math.floor(Math.random() * 0x100) & (op & 0x0FF);
      break;

    }

    case 0xD000: {

      // Dxyn

      // TODO: display collision logic
      break;

    }

    case 0xE000: {

      // Exnn
      // See switch for values of nn

      // TODO: input logic
      let bits = op & 0x00FF;

      switch(bits) {
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

      let bits = op & 0x00FF;

      switch(bits) {

        case 0x0007: {
          // Fx07
          // Set Vx to DT

          // TODO
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

          // TODO
          break;
        }

        case 0x0018: {
          // Fx18
          // Set ST to Vx

          // TODO
          break;
        }

        case 0x001E: {
          // Fx1E
          // Add Vx to I
          this.registers.I += this.registers.V[op & 0x0F00];
          break;
        }

        case 0x0029: {
          // Fx29
          // Set I to location of sprite for
          // digit Vx

          // TODO
          break;
        }

        case 0x0033: {
          // Fx33
          // Get value from Vx, store each digit in I, I+1 & I+2
          let v = this.registers.V[op & 0x0F00];
          this.memory[this.registers.I    ] = v & 0x0F00;
          this.memory[this.registers.I + 1] = v & 0x00F0;
          this.memory[this.registers.I + 2] = v & 0x000F;
          break;
        }

        case 0x0055: {
          // Fx55
          // Store registers V0 -> Vx into memory starting at I
          let n = op & 0x0F00;
          for(let i = 0; i < n; i++) {
            this.memory[this.registers.I + i] = this.registers.V[i]
          }
          break;
        }

        case 0x0065: {
          // Fx65
          // Store memory starting at I into registers V0 -> Vx
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

}

CPU.prototype.stop = function() {
  clearTimeout(this.cpuTimer);
  clearTimeout(this.delayTimer);
  clearTimeout(this.soundTimer);
}

export default CPU;
