
function CPU() {

  this.speed = 100;

  this.romBase = 0x200;

  this.registers = {
    V:  new Array(16),
    I:  0
    VF: 0
  };

  this.PC = this.romBase;

  this.stack = [];

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

      if(this.registers.V[op & 0x0F00] == this.reigsters.V[op & 0x00F0]) {
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

      let bit = 0x000F;

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
          // TODO
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
          // TODO
          break;
        }

        case 0x0055: {
          // TODO
          break;
        }

        case 0x0065: {
          // TODO
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

  this.clock = setInterval(() => this.step(), frame);

}

CPU.prototype.stop = function() {
  clearTimeout(this.clock);
}
