import { DynamicPropertyManager } from "../../classes/DynamicPropertyManager.js";
import config from "../../data/config.js";
import { extendPlayerPrototype } from "../../classes/PlayerExtended/Player.js";
import { WorldExtended, extendWorldPrototype } from "../../classes/WorldExtended/World.js";
import { world } from "@minecraft/server";

// Get the singleton instance of DynamicPropertyManager
const dynamicPropertyRegistry = DynamicPropertyManager.getInstance();

// Define types for deep equality checks
type Primitive = string | number | boolean | null | undefined;
type DeepEqual<T> = T extends Primitive ? true : T extends Array<infer U> ? DeepEqualArray<U> : T extends Record<string, infer U> ? DeepEqualObject<U> : never;
type DeepEqualArray<T> = T extends Array<infer U> ? Array<DeepEqual<U>> : never;
type DeepEqualObject<T> = { [K in keyof T]: DeepEqual<T[K]> };

/**
 * Deeply compare two objects for equality.
 * @param obj1 The first object.
 * @param obj2 The second object.
 * @returns True if the objects are deeply equal, false otherwise.
 */
function deepEqual<T>(obj1: T, obj2: T): boolean {
    if (obj1 === obj2) {
        return true;
    }

    if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1) as Array<keyof T>;
    const keys2 = Object.keys(obj2) as Array<keyof T>;

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

// Define a structure for representing the differences between two objects
interface Difference {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: Difference | any;
}

/**
 * Find the differences between two objects.
 * @param obj1 The first object.
 * @param obj2 The second object.
 * @param path An array representing the current path in the object hierarchy.
 * @returns An object representing the differences.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function diffObjects(obj1: Record<string, any>, obj2: Record<string, any>, path: string[] = []): Difference {
    const diff: Difference = {};
    for (const key in obj1) {
        const currentPath = [...path, key];

        if (typeof obj1[key] === "object" && obj1[key] !== null && obj2[key] !== null && typeof obj2[key] === "object") {
            const nestedDiff = diffObjects(obj1[key], obj2[key], currentPath);
            if (nestedDiff && Object.keys(nestedDiff).length > 0) {
                diff[key] = nestedDiff;
            }
        } else if (!deepEqual(obj1[key], obj2[key])) {
            diff[key] = obj1[key];
        }
    }
    return diff;
}

/**
 * Recursively merges differences from `diff` object into `obj`.
 * @param obj The original object to be merged into.
 * @param diff The differences to be merged from.
 * @returns The merged object containing the changes from the `diff` object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mergeObjects(obj: Record<string, any>, diff: Record<string, any>): Record<string, any> {
    for (const key in diff) {
        if (typeof diff[key] === "object" && !Array.isArray(diff[key])) {
            obj[key] = mergeObjects(obj[key], diff[key]);
        } else {
            obj[key] = diff[key];
        }
    }
    return obj;
}

/**
 * Manage dynamic property registration and configuration changes.
 * @returns A promise that resolves when the registry is updated.
 */
function registry(): Promise<void> {
    return new Promise<void>((resolve) => {
        // Extend Prototypes here
        extendPlayerPrototype();
        extendWorldPrototype();

        /**
         * This is global security for strings where applicable
         */
        const salt = world.getDynamicProperty("crypt");
        if (salt === undefined) {
            world.setDynamicProperty("crypt", (world as WorldExtended).generateRandomUUID());
        }

        // Check if the "config" property already exists
        const existingConfig = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig");
        // Check if the "backupConfig" property already exists
        const backupConfig = dynamicPropertyRegistry.getProperty(undefined, "paradoxBackupConfig");

        if (!existingConfig) {
            // Create the "paradoxConfig" property with the new value
            dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", config);
            // Create the backup with the current config object
            dynamicPropertyRegistry.setProperty(undefined, "paradoxBackupConfig", config);
            resolve();
            return;
        }

        if (!backupConfig) {
            // Create the backup with the current "paradoxBackupConfig"
            dynamicPropertyRegistry.setProperty(undefined, "paradoxBackupConfig", config);
            resolve();
            return;
        }

        // Determine what has changed in the config object compared to the backup
        const changes = diffObjects(config, backupConfig as object);

        if (Object.keys(changes).length > 0) {
            // Update the backup with the current config object
            dynamicPropertyRegistry.setProperty(undefined, "paradoxBackupConfig", config);

            // Merge the changes into the "paradoxConfig" property
            const mergedConfig = mergeObjects(config, changes);

            dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", mergedConfig);
        }

        resolve();
    });
}

/**
 * Initialize registry after the world has initialized.
 * @returns A promise that resolves when the registry is initialized.
 */
const Registry = (): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        world.afterEvents.worldInitialize.subscribe(async () => {
            await registry()
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    });
};

export { Registry, dynamicPropertyRegistry };
