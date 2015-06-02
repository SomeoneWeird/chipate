
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

    describe("7xkk - ADD Vx, byte", function() {


    });

    describe("8xy1 - OR Vx, Vy", function() {


    });

    describe("8xy2 - AND Vx, Vy", function() {


    });

    describe("8xy3 - XOR Vx, Vy", function() {


    });

    describe("8xy4 - ADD Vx, Vy", function() {


    });

    describe("8xy5 - SUB Vx, Vy", function() {


    });

    describe("8xy6 - SHR Vx", function() {


    });

    describe("8xy7 - SUBN Vx, Vy", function() {


    });

    describe("8xyE - SHL Vx", function() {


    });

    describe("9xy0 - SNE Vx, Vy", function() {


    });

    describe("Cxkk - RND Vx, byte", function() {


    });

    describe("Dxyn - DRW Vx, Vy, n", function() {


    });

    describe("Ex9E - SKP Vx", function() {


    });

    describe("ExA1 - SKNP Vx", function() {


    });

    describe("Fx0A - LD Vx, K", function() {


    });

    describe("Fx29 - LD F, Vx", function() {


    });

    describe("Fx33 - LD B, Vx", function() {


    });

    describe("Fx55 - LD [I], Vx", function() {


    });

    describe("Fx65 - LD Vx, [I]", function() {


    });

  });

});
