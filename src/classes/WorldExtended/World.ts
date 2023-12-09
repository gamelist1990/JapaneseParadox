import { Player, World, world } from "@minecraft/server";
import CryptoJS from "../../node_modules/crypto-es/lib/index.js";

export interface WorldExtended extends World {
    /**
     * Hashes a given string with the specified salt value using SHA-3 (SHA3-256) encryption.
     *
     * @param {string} salt - Hashes information
     * @param {string} str - String to be hashed
     * @returns {string} The hashed string
     */
    hashWithSalt(salt: string, str: string): string | null;

    /**
     * Encrypts a string using AES encryption with the specified salt as the key.
     *
     * @param {string} str - The string to encrypt
     * @param {string} salt - The salt to use as the key for encryption
     * @returns {string} The encrypted string
     */
    encryptString(str: string, salt: string): string;

    /**
     * Decrypts a string using AES encryption with the specified salt as the key.
     *
     * @param {string} str - The string to decrypt
     * @param {string} salt - The salt to use for decryption
     * @returns {string} The decrypted string
     */
    decryptString(str: string, salt: string): string;

    /**
     * Converts a string to camelCase.
     * @param {string} str - The input string.
     * @returns {string} The camelCase string.
     */
    toCamelCase(str: string): string;

    /**
     * Converts a string to PascalCase.
     * @param {string} str - The input string.
     * @returns {string} The PascalCase string.
     */
    toPascalCase(str: string): string;

    /**
     * Converts a string to Title Case.
     * @param {string} str - The input string.
     * @returns {string} The Title Case string.
     */
    titleCase(str: string): string;

    /**
     * Generates a random UUID (RFC4122 version 4 compliant).
     * @returns {string} The generated UUID.
     */
    generateRandomUUID(): string;

    /**
     * Validates whether a given string is a valid UUID.
     * @param {string} uuid - The string to validate as a UUID.
     * @returns {boolean} - Returns true if the string is a valid UUID, false otherwise.
     */
    isValidUUID(uuid: string): boolean;

    /**
     * Gets a player by their name.
     * @param playerName The name of the player.
     * @returns The player with the specified name, or null if not found.
     */
    getPlayerByName(playerName: string): Player | null;

    /**
     * Gets a player by their ID.
     * @param playerId The ID of the player.
     * @returns The player with the specified ID, or null if not found.
     */
    getPlayerById(playerId: string): Player | null;
}

function hashWithSalt(salt: string, text: string): string | null {
    if (typeof salt !== "string") {
        return null;
    }
    const combinedString = salt + text;
    const hash = CryptoJS.SHA3(combinedString, { outputLength: 256 }).toString();
    return hash.substring(0, 50);
}

function encryptString(str: string, salt: string): string {
    const encrypted = CryptoJS.AES.encrypt(str, salt).toString();
    return "1337" + encrypted;
}

function decryptString(str: string, salt: string): string {
    str = str.slice(4); // Remove the prefix added in the encryptString function
    const decryptedBytes = CryptoJS.AES.decrypt(str, salt);
    const plaintext = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
}

function toCamelCase(str: string): string {
    const regExp = /[^a-zA-Z0-9]+(.)/gi;
    return str.replace(regExp, (match) => {
        return match[1].toUpperCase();
    });
}

function toPascalCase(str: string): string {
    const camelCase = (world as WorldExtended).toCamelCase(str);
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

function titleCase(str: string): string {
    return str.replace(/^[-_]*(.)/, (_, c) => c.toUpperCase()).replace(/[-_]+(.)/g, (_, c) => " " + c.toUpperCase());
}

function generateRandomUUID(): string {
    const lut: string[] = [];
    for (let i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? "0" : "") + i.toString(16);
    }

    const d0 = (Math.random() * 0x100000000) >>> 0;
    const d1 = (Math.random() * 0x100000000) >>> 0;
    const d2 = (Math.random() * 0x100000000) >>> 0;
    const d3 = (Math.random() * 0x100000000) >>> 0;

    return (
        lut[d0 & 0xff] +
        lut[(d0 >> 8) & 0xff] +
        lut[(d0 >> 16) & 0xff] +
        lut[(d0 >> 24) & 0xff] +
        "-" +
        lut[d1 & 0xff] +
        lut[(d1 >> 8) & 0xff] +
        "-" +
        lut[((d1 >> 16) & 0x0f) | 0x40] +
        lut[(d1 >> 24) & 0xff] +
        "-" +
        lut[(d2 & 0x3f) | 0x80] +
        lut[(d2 >> 8) & 0xff] +
        "-" +
        lut[(d2 >> 16) & 0xff] +
        lut[(d2 >> 24) & 0xff] +
        lut[d3 & 0xff] +
        lut[(d3 >> 8) & 0xff] +
        lut[(d3 >> 16) & 0xff] +
        lut[(d3 >> 24) & 0xff]
    );
}

function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

function getPlayerByName(playerName: string): Player | null {
    const player = world.getPlayers({ name: playerName })[0];
    if (player.name === playerName) {
        return player;
    }
    return null;
}

function getPlayerById(playerId: string): Player | null {
    const players = world.getPlayers();
    for (const player of players) {
        if (player.id === playerId) {
            return player;
        }
    }
    return null;
}

export function extendWorldPrototype() {
    (World.prototype as WorldExtended).hashWithSalt = function (salt: string, str: string): string | null {
        return hashWithSalt(salt, str);
    };

    (World.prototype as WorldExtended).encryptString = function (str: string, salt: string): string {
        return encryptString(str, salt);
    };

    (World.prototype as WorldExtended).decryptString = function (str: string, salt: string): string {
        return decryptString(str, salt);
    };

    (World.prototype as WorldExtended).toCamelCase = function (str: string): string {
        return toCamelCase(str);
    };

    (World.prototype as WorldExtended).toPascalCase = function (str: string): string {
        return toPascalCase(str);
    };

    (World.prototype as WorldExtended).titleCase = function (str: string): string {
        return titleCase(str);
    };

    (World.prototype as WorldExtended).generateRandomUUID = function (): string {
        return generateRandomUUID();
    };

    (World.prototype as WorldExtended).isValidUUID = function (uuid: string): boolean {
        return isValidUUID(uuid);
    };

    (World.prototype as WorldExtended).getPlayerByName = function (playerName: string): Player {
        return getPlayerByName(playerName);
    };

    (World.prototype as WorldExtended).getPlayerById = function (playerId: string): Player {
        return getPlayerById(playerId);
    };
}
