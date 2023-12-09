import { world, Player, Entity, Vector3 } from "@minecraft/server";

type PropertyValue = string | number | boolean | Vector3 | object;

export class DynamicPropertyManager {
    // Singleton instance
    private static instance: DynamicPropertyManager | null = null;
    private propertyCache: Map<string, PropertyValue> = new Map<string, PropertyValue>();

    /**
     * Private constructor for the singleton pattern.
     */
    private constructor() {
        if (DynamicPropertyManager.instance) {
            return DynamicPropertyManager.instance;
        }
        DynamicPropertyManager.instance = this;
    }

    /**
     * Get the singleton instance of DynamicPropertyManager.
     * @returns The singleton instance of DynamicPropertyManager.
     */
    public static getInstance(): DynamicPropertyManager {
        if (!DynamicPropertyManager.instance) {
            DynamicPropertyManager.instance = new DynamicPropertyManager();
        }
        return DynamicPropertyManager.instance;
    }

    /**
     * Serialize a value to a JSON string.
     * @param value The value to serialize.
     * @returns The JSON string representation of the value.
     */
    private serialize(value: PropertyValue): string {
        return JSON.stringify(value, (_, val) => {
            if (val instanceof RegExp) {
                return { __regex__: val.toString() };
            }
            return val;
        });
    }

    /**
     * Deserialize a JSON string to a property value.
     * @param serializedValue The JSON string to deserialize.
     * @returns The deserialized property value.
     */
    private deserialize(serializedValue: string): PropertyValue {
        try {
            return JSON.parse(serializedValue, (_, val) => {
                if (val && val.__regex__) {
                    const regexMatch = val.__regex__.match(/\/(.*)\/([a-z]*)/);
                    return new RegExp(regexMatch[1], regexMatch[2]);
                }
                return val;
            });
        } catch (error) {
            // Return a default value
            return serializedValue;
        }
    }

    /**
     * Set a dynamic property for a player or the world.
     * @param player The player for whom to set the property. Pass undefined for the world.
     * @param name The name of the property.
     * @param value The value to set.
     */
    setProperty(player: Player | undefined, name: string, value: PropertyValue): void {
        // Update the cache with the new value
        this.propertyCache.set(name, value);

        const serializedValue = typeof value === "string" ? value : this.serialize(value);
        let currentIndex = 0;
        let remainingValue = serializedValue;

        while (remainingValue.length > 0) {
            const chunk = remainingValue.slice(0, 32766);
            const propertyName = currentIndex === 0 ? name : `${name}_${currentIndex}`;

            if (player) {
                player.setDynamicProperty(propertyName, chunk);
            } else {
                world.setDynamicProperty(propertyName, chunk);
            }

            remainingValue = remainingValue.slice(32766);
            currentIndex++;
        }
    }

    /**
     * Get a dynamic property for a player or the world.
     * @param player The player for whom to get the property. Pass undefined for the world.
     * @param name The name of the property.
     * @returns The value of the property, or undefined if it doesn't exist.
     */
    getProperty(player: Player | undefined, name: string): PropertyValue | undefined {
        // Check the cache first
        if (this.propertyCache.has(name)) {
            return this.propertyCache.get(name);
        }

        let serializedValue: string | undefined = player ? (player.getDynamicProperty(name) as string) : (world.getDynamicProperty(name) as string);

        let index = 0;
        while (true) {
            const propertyName = `${name}_${index}`;
            const partValue = player ? player.getDynamicProperty(propertyName) : world.getDynamicProperty(propertyName);
            if (partValue === undefined) {
                break;
            }
            serializedValue = serializedValue ? serializedValue + (partValue as string) : (partValue as string);
            index++;
        }

        if (serializedValue) {
            const deserializedValue = this.deserialize(serializedValue);
            // Cache the value for future access
            this.propertyCache.set(name, deserializedValue);
            return deserializedValue;
        }
        return undefined;
    }

    /**
     * Delete a dynamic property for a player, entity, or the world.
     * @param player The player or entity for whom to delete the property. Pass undefined for the world.
     * @param name The name of the property to delete.
     */
    deleteProperty(player: Player | Entity | undefined, name: string): void {
        // Clear the cache for the deleted property
        this.propertyCache.delete(name);

        let index = 0;
        while (true) {
            const dynamicPropertyName = `${name}_${index}`;
            const existingValue = player ? player.getDynamicProperty(dynamicPropertyName) : world.getDynamicProperty(dynamicPropertyName);
            if (existingValue === undefined) {
                break;
            }

            if (player) {
                player.setDynamicProperty(dynamicPropertyName);
            } else {
                world.setDynamicProperty(dynamicPropertyName);
            }

            index++;
        }

        if (index === 0) {
            // Delete the dynamic property using the exact name
            if (player) {
                player.setDynamicProperty(name);
            } else {
                world.setDynamicProperty(name);
            }
        }
    }

    /**
     * Check if a dynamic property exists for a specific player by its name.
     * @param player The player object.
     * @param name The name of the property.
     * @returns True if the property exists, false otherwise.
     */
    hasProperty(player: Player, name: string): boolean {
        // Check for the existence of the property in the dynamic property registry
        return player.getDynamicProperty(name) !== undefined;
    }
}
