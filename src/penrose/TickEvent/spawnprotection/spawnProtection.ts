import { world, system, PlayerLeaveAfterEvent } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import { PlayerExtended } from "../../../classes/PlayerExtended/Player.js";
import { WorldExtended } from "../../../classes/WorldExtended/World.js";
import ConfigInterface from "../../../interfaces/Config.js";

const playerGamemodes = new Map<string, string>(); // Map to store player IDs and gamemodes

/**
 * Event handler for player logout.
 * @param event - The PlayerLeaveAfterEvent object.
 */
function onPlayerLogout(event: PlayerLeaveAfterEvent): void {
    // Remove the player's data from the map when they log off
    const playerName = event.playerId;
    playerGamemodes.delete(playerName);
}

/**
 * Function to handle spawn protection logic.
 * @param id - The ID for interval management.
 */
async function spawnProtection(id: number) {
    // Get Dynamic Property for spawn protection
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const spawnProtectionBoolean = configuration.modules.spawnprotection.enabled;

    // Unsubscribe if spawn protection is disabled in-game
    if (!spawnProtectionBoolean) {
        playerGamemodes.forEach((playerId) => {
            const player = (world as WorldExtended).getPlayerById(playerId);
            player.runCommandAsync(`gamemode ${playerGamemodes.get(playerId)} @s`);
        });
        world.afterEvents.playerLeave.unsubscribe(onPlayerLogout);
        playerGamemodes.clear();
        system.clearRun(id);
        return;
    }

    // Center of the world spawn
    const centerXYZ = configuration.modules.spawnprotection.vector3;
    // The radius to check within
    const radius = configuration.modules.spawnprotection.radius;

    const players = world.getPlayers();
    for (const player of players) {
        const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

        // Skip if the player has permission
        if (uniqueId === player.name) {
            continue;
        }

        if (player.dimension.id === "minecraft:overworld") {
            const { x, y, z } = player.location;

            // Calculate squared distance
            const dx = x - centerXYZ.x;
            const dy = y - centerXYZ.y;
            const dz = z - centerXYZ.z;
            const squaredDistance = dx * dx + dy * dy + dz * dz;

            // Calculate squared radius for comparison
            const radiusSquared = radius * radius;

            // Retrieve or fetch the player's gamemode
            const currentGamemode = playerGamemodes.get(player.id) || (player as PlayerExtended).getGameMode();

            // Determine the desired gamemode based on the distance
            const desiredGamemode = squaredDistance <= radiusSquared ? "adventure" : "survival";

            // Change the gamemode if needed
            if (currentGamemode !== desiredGamemode) {
                await player.runCommandAsync(`gamemode ${desiredGamemode.charAt(0)} @s`);
                playerGamemodes.set(player.id, desiredGamemode); // Update the gamemode in the map
            }
        }
    }
}

/**
 * Start the spawn protection logic at a regular interval.
 */
export function SpawnProtection() {
    world.afterEvents.playerLeave.subscribe(onPlayerLogout);
    const spawnProtectionId = system.runInterval(() => {
        spawnProtection(spawnProtectionId);
    }, 20);
}
