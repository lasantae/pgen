import { describe, it, expect } from 'vitest';
import { generatePassword } from '../src/generatePassword.js';

describe('generatePassword', () => {
    it('should throw an error if length is less than 8', () => {
        expect(() => generatePassword(7)).toThrow("Password length must be at least 8");
        expect(() => generatePassword(0)).toThrow("Password length must be at least 8");
        expect(() => generatePassword(-1)).toThrow("Password length must be at least 8");
    });

    it('should generate a password of the specified length', () => {
        const length = 10;
        const password = generatePassword(length);
        expect(password.length).toBe(length);
    });

    it('should start with a letter', () => {
        for (let i = 0; i < 50; i++) {
            const password = generatePassword(12);
            expect(password[0]).toMatch(/[a-zA-Z]/);
        }
    });

    it('should contain at least one uppercase letter', () => {
        for (let i = 0; i < 50; i++) {
            const password = generatePassword(10);
            expect(password).toMatch(/[A-Z]/);
        }
    });

    it('should contain at least one symbol', () => {
        const symbols = "!@$%^&*()_+=<>/?";
        for (let i = 0; i < 50; i++) {
            const password = generatePassword(10);
            let hasSymbol = false;
            for (const char of password) {
                if (symbols.includes(char)) {
                    hasSymbol = true;
                    break;
                }
            }
            expect(hasSymbol).toBe(true);
        }
    });

    it('should contain a number (0-99)', () => {
        for (let i = 0; i < 50; i++) {
            const password = generatePassword(12);
            expect(password).toMatch(/\d/);
        }
    });
});
