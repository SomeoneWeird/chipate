
import assert from "assert";

import CPU from "../cpu.js";

describe("Chip8 CPU", function() {

  describe("reset", function() {

    it("should reset the state of the CPU", function() {

      let cpu = new CPU();

      cpu.registers.I = 5;

      cpu.reset();

      assert.equal(cpu.registers.I, 0);

    });

    it("should load font into memory when reset", function() {

      let cpu = new CPU();

      assert.equal(cpu.memory[0x80], 0xF0);
      assert.equal(cpu.memory[0x89], 0x70);

    });

  });

  describe("load", function() {

    it("should load program into memory starting at romBase", function() {

      let cpu = new CPU();

      cpu.load([ 0x01, 0x02, 0x03, 0x04 ]);

      assert.equal(cpu.memory[cpu.romBase    ], 0x01);
      assert.equal(cpu.memory[cpu.romBase + 1], 0x02);
      assert.equal(cpu.memory[cpu.romBase + 2], 0x03);
      assert.equal(cpu.memory[cpu.romBase + 3], 0x04);

    });

  });

  describe("OPCodes", function() {

    describe("00E0 - CLS", function() {

      xit("should clear the display");

    });

    describe("00EE - RET", function() {

      it("should set PC to top of stack", function() {

        let cpu = new CPU([
          0x00, 0xEE // RET
        ]);

        cpu.stack.push(0x205);

        assert.equal(cpu.PC, 0x200);

        cpu.step();

        assert.equal(cpu.PC, 0x205);

      });

    });

    describe("1nnn - JMP addr", function() {

      it("should jump to address", function() {

        let cpu = new CPU([
          0x14, 0x56 // JMP to 0x456
        ]);

        assert.equal(cpu.PC, 0x200);

        cpu.step();

        assert.equal(cpu.PC, 0x456);

      });

    });

    describe("2nnn - CALL addr", function() {

    });

    describe("3xkk - SE Vx, byte", function() {

      it("should skip instruction", function() {

        let cpu = new CPU([
          0x30, 0x01,
          0x14, 0x56
        ]);

        cpu.registers.V[0] = 1;

        cpu.step();

        assert.equal(cpu.PC, 0x204);

      });

      it("should not skip instruction", function() {

        let cpu = new CPU([
          0x30, 0x01,
          0x14, 0x56
        ]);

        cpu.registers.V[0] = 0;

        cpu.step();

        assert.equal(cpu.PC, 0x202);

      });

    });

    describe("4xkk - SNE Vx, byte", function() {

      it("should skip instruction", function() {

        let cpu = new CPU([
          0x40, 0x01,
          0x14, 0x56
        ]);

        cpu.registers.V[0] = 0;

        cpu.step();

        assert.equal(cpu.PC, 0x204);

      });

      it("should not skip instruction", function() {

        let cpu = new CPU([
          0x40, 0x01,
          0x14, 0x56
        ]);

        cpu.registers.V[0] = 1;

        cpu.step();

        assert.equal(cpu.PC, 0x202);

      });

    });

    describe("5xy0 - SE Vx, Vy", function() {

      it("should skip instruction", function() {

        let cpu = new CPU([
          0x50, 0x10,
          0x14, 0x56
        ]);

        cpu.registers.V[0] = 0;
        cpu.registers.V[1] = 0;

        cpu.step();

        assert.equal(cpu.PC, 0x204);

      });

      it("should not skip instruction", function() {

        let cpu = new CPU([
          0x50, 0x10,
          0x14, 0x56
        ]);

        cpu.registers.V[0] = 1;
        cpu.registers.V[1] = 0;

        cpu.step();

        assert.equal(cpu.PC, 0x202);

      });

    });

    describe("6xkk - LD Vx, kk", function() {

      it("should set register to value", function() {

        let cpu = new CPU([
          0x65, 0x11
        ]);

        assert.equal(cpu.registers.V[5], undefined);

        cpu.step();

        assert.equal(cpu.registers.V[5], 0x11);

      });

    });

    describe("7xkk - ADD Vx, byte", function() {

      it("should add value to register", function() {

        let cpu = new CPU([
          0x74, 0x11
        ]);

        cpu.registers.V[4] = 0x22;

        cpu.step();

        assert.equal(cpu.registers.V[4], 0x33);

      });

    });

    describe("8xyn", function() {

      describe("8xy0 - SET Vx, Vy", function() {

        it("should set register Vx to Vy", function() {

          let cpu = new CPU([
            0x81, 0x20 // SET V1 to V2
          ]);

          cpu.registers.V[2] = 0x10;

          cpu.step();

          assert.equal(cpu.registers.V[1], cpu.registers.V[2]);

        });

      });

      describe("8xy1 - OR Vx, Vy", function() {

        it("should OR registers Vx with Vy", function() {

          let cpu = new CPU([
            0x81, 0x21 // OR V1 with V2
          ]);

          cpu.registers.V[1] = 0x80;
          cpu.registers.V[2] = 0x13;

          cpu.step();

          assert.equal(cpu.registers.V[1], 0x80 | 0x13);

        });

      });

      describe("8xy2 - AND Vx, Vy", function() {

        it("should AND registers Vx with Vy", function() {

          let cpu = new CPU([
            0x81, 0x22 // AND V1 with V2
          ]);

          cpu.registers.V[1] = 0x80;
          cpu.registers.V[2] = 0x13;

          cpu.step();

          assert.equal(cpu.registers.V[1], 0x80 & 0x13);

        });

      });

      describe("8xy3 - XOR Vx, Vy", function() {

        it("should XOR registers Vx with Vy", function() {

          let cpu = new CPU([
            0x81, 0x23 // XOR V1 with V2
          ]);

          cpu.registers.V[1] = 0x80;
          cpu.registers.V[2] = 0x13;

          cpu.step();

          assert.equal(cpu.registers.V[1], 0x80 ^ 0x13);

        });

      });

      describe("8xy4 - ADD Vx, Vy", function() {

        it("should ADD registers Vx with Vy", function() {

          let cpu = new CPU([
            0x81, 0x24 // ADD V2 to V1
          ]);

          cpu.registers.V[1] = 0x01;
          cpu.registers.V[2] = 0x02;

          cpu.step();

          assert.equal(cpu.registers.V[1], 0x03);

        });

        it("should set VF is result is over 255", function() {

          let cpu = new CPU([
            0x81, 0x24 // ADD V2 to V1
          ]);

          cpu.registers.V[1] = 0xFF;
          cpu.registers.V[2] = 0x02;
          cpu.registers.VF = 0;

          cpu.step();

          assert.equal(cpu.registers.V[1], 0x01);
          assert.equal(cpu.registers.VF, 1);

        });

      });

      describe("8xy5 - SUB Vx, Vy", function() {

        it("should subtract Vy from Vx", function() {

          let cpu = new CPU([
            0x85, 0x65 // SUB V2 from V1
          ]);

          cpu.registers.V[5] = 0xFF;
          cpu.registers.V[6] = 0x0F;
          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.V[5], 0xFF - 0x0F);
          assert.equal(cpu.registers.VF, 1);

        });

        it("should not set VF flag if Vy > Vx", function() {

          let cpu = new CPU([
            0x85, 0x65 // SUB
          ]);

          cpu.registers.V[5] = 0xF0;
          cpu.registers.V[6] = 0xFF;

          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.VF, 0);
          assert.equal(cpu.registers.V[5], 0xF0 - 0xFF);

        });

      });

      describe("8xy6 - SHR Vx", function() {

        it("should divide Vx by 2", function() {

          var cpu = new CPU([
            0x81, 0x06
          ]);

          cpu.registers.V[1] = 0x04;

          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.VF, 0);
          assert.equal(cpu.registers.V[1], 0x02);

        });

        it("should set VF if LSB of Vx is 1", function() {

          var cpu = new CPU([
            0x81, 0x06
          ]);

          cpu.registers.V[1] = 0x01;

          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.VF, 1);
          assert.equal(cpu.registers.V[1], 0x00);

        });

        it("should set VF if LSB of Vx is 1", function() {

          var cpu = new CPU([
            0x81, 0x06
          ]);

          cpu.registers.V[1] = 0x01;

          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.VF, 1);
          assert.equal(cpu.registers.V[1], 0x00);

        });

      });

      describe("8xy7 - SUBN Vx, Vy", function() {

        it("should subtract Vx from Vy", function() {

          let cpu = new CPU([
            0x85, 0x67 // SUB V2 from V1
          ]);

          cpu.registers.V[5] = 0x0F;
          cpu.registers.V[6] = 0xFF;
          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.V[5], 0xFF - 0x0F);
          assert.equal(cpu.registers.VF, 1);

        });

        it("should not set VF flag if Vx > Vy", function() {

          let cpu = new CPU([
            0x85, 0x67 // SUB
          ]);

          cpu.registers.V[5] = 0xFF;
          cpu.registers.V[6] = 0xF0;

          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.VF, 0);
          assert.equal(cpu.registers.V[5], 0xF0 - 0xFF);

        });

      });

      describe("8xyE - SHL Vx", function() {

        it("should multiply Vx by 2", function() {

          var cpu = new CPU([
            0x81, 0x0E
          ]);

          cpu.registers.V[1] = 0x04;

          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.VF, 0);
          assert.equal(cpu.registers.V[1], 0x08);

        });

        it("should set VF if MSB of Vx is 1", function() {

          var cpu = new CPU([
            0x81, 0x0E
          ]);

          cpu.registers.V[1] = 0xF0;

          assert.equal(cpu.registers.VF, 0);

          cpu.step();

          assert.equal(cpu.registers.VF, 1);
          assert.equal(cpu.registers.V[1], 0xE0);

        });

      });

    });

    describe("9xy0 - SNE Vx, Vy", function() {

      it("should skip instruction", function() {

        let cpu = new CPU([
          0x90, 0x10, // Skip next if Vx != Vy
          0x14, 0x56 // JMP
        ]);

        cpu.registers.V[0] = 0;
        cpu.registers.V[1] = 1;

        cpu.step();

        assert.equal(cpu.PC, 0x204);

      });

      it("should not skip instruction", function() {

        let cpu = new CPU([
          0x90, 0x10,
          0x14, 0x56
        ]);

        cpu.registers.V[0] = 0;
        cpu.registers.V[1] = 0;

        cpu.step();

        assert.equal(cpu.PC, 0x202);

      });

    });

    describe("Annn - LD I, addr", function() {

      it("should set I to address", function() {

        var cpu = new CPU([
          0xA1, 0x32
        ]);

        assert.equal(cpu.registers.I, 0);

        cpu.step();

        assert.equal(cpu.registers.I, 0x132)

      });

    });

    describe("Bnnn, LD PC, addr + V0", function() {

      it("should set PC to address plus V0", function() {

        var cpu = new CPU([
          0xBF, 0xF0
        ]);

        cpu.registers.V[0] = 0x0F;

        assert.equal(cpu.PC, 0x200);

        cpu.step();

        assert.equal(cpu.PC, 0xFFF);

      });

    });

    describe("Cxkk - RND Vx, byte", function() {

      // TODO: how do I test this? make sure it's diff each time?

    });

    describe("Dxyn - DRW Vx, Vy, n", function() {

      // TODO

    });

    describe("Ex9E - SKP Vx", function() {

      // TODO

    });

    describe("ExA1 - SKNP Vx", function() {

      // TODO

    });

    describe("Fx07 - LD Vx, DT", function() {

      it("should load value of DT into Vx", function() {

        var cpu = new CPU([
          0xF5, 0x07
        ]);

        cpu.registers.DT = 0x05;

        cpu.step();

        assert.equal(cpu.registers.V[5], 0x05);

      });

    });

    describe("Fx0A - LD Vx, K", function() {

      // TODO

    });

    describe("Fx15 - LD DT, Vx", function() {

      it("should set DT to Vx", function() {

        var cpu = new CPU([
          0xF7, 0x15
        ]);

        cpu.registers.V[7] = 0x05;

        assert.equal(cpu.registers.V[7], 0x05);

        cpu.step();

        assert.equal(cpu.registers.DT, 0x05);

      });

    });

    describe("Fx18 - LD ST, Vx", function() {

      it("should set ST to Vx", function() {

        var cpu = new CPU([
          0xF4, 0x18
        ]);

        cpu.registers.V[4] = 0x03;

        assert.equal(cpu.registers.V[4], 0x03);

        cpu.step();

        assert.equal(cpu.registers.ST, 0x03);

      });

    });

    describe("0xFx1E - ADD I, Vx", function() {

      xit("should add Vx to I", function() {

        var cpu = new CPU([
          0xF1, 0x1E
        ]);

        cpu.registers.I = 0x01;
        cpu.registers.V[1] = 0x05;

        cpu.step();

        assert.equal(cpu.registers.I, 0x06);

      });

    });

    describe("Fx29 - LD F, Vx", function() {

      it("should set I to location of sprite for value of Vx", function() {

        var cpu = new CPU([
          0xFC, 0x29
        ]);

        cpu.registers.V[0xC] = 0xA;

        assert.equal(cpu.registers.I, 0);

        cpu.step();

        assert.equal(cpu.registers.I, 0x32 + cpu.fontBase);

      });

    });

    describe("Fx33 - LD B, Vx", function() {

      it("should store individual digits of a BCD (Binary Coded Digit) in register I, I+1, I+2", function() {

        var cpu = new CPU([
          0xF4, 0x33
        ]);

        cpu.registers.I = 0x100;
        cpu.registers.V[4] = 0x543;

        assert.equal(cpu.memory[0x100], undefined);
        assert.equal(cpu.memory[0x101], undefined);
        assert.equal(cpu.memory[0x102], undefined);

        cpu.step();

        assert.equal(cpu.memory[0x100], 5);
        assert.equal(cpu.memory[0x101], 4);
        assert.equal(cpu.memory[0x102], 3);
      });

    });

    describe("Fx55 - LD [I], Vx", function() {

      // TODO

    });

    describe("Fx65 - LD Vx, [I]", function() {

      // TODO

    });

  });

});
