import { world, system,  GameMode, } from "@minecraft/server";
import config from "../../../data/config.js";
import { flag, isTimerExpired } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";

// Create a Map to store each player's last known position, timestamp, and highest speed
const playerData = new Map();

function onPlayerSpawn(event) {
    if (event.initialSpawn === true) {
        return;
    }

    const playerName = event.player.id;

    // Initialize player data when they spawn
    playerData.set(playerName, {
        lastPosition: [event.player.location.x, event.player.location.y, event.player.location.z],
        lastTimestamp: Date.now(),
        highestBps: 0,
        lastHitTimestamp: 0,
    });
}

function onEntityHurt(event) {
    if (!event.hurtEntity.isValid()) {
        return;
    }

    const playerName = event.hurtEntity.id;

    // Update the last hit timestamp for the player
    if (playerData.has(playerName)) {
        const playerInfo = playerData.get(playerName);
        playerInfo.lastHitTimestamp = Date.now();
    }
}

function onPlayerLogout(event) {
    // Remove the player's data from the map when they log off
    const playerName = event.playerId;
    playerData.delete(playerName);
}

function calculateMovementBPS(currentPosition, lastPosition, playerTimestamp, lastTimestamp) {
    const timeElapsedInSeconds = (playerTimestamp - lastTimestamp) / 1000;

    // Check for valid timeElapsedInSeconds
    if (timeElapsedInSeconds <= 0 || !isFinite(timeElapsedInSeconds)) {
        return 0;
    }

    const [dx, dy, dz] = [currentPosition[0] - lastPosition[0], currentPosition[1] - lastPosition[1], currentPosition[2] - lastPosition[2]];

    // Ignore purely vertical movement and downward vertical movement only
    if (dy <= 0 && Math.abs(dx) < Math.abs(dy) && Math.abs(dz) < Math.abs(dy)) {
        return 0;
    }

    // Calculate distance moved (ignoring vertical movement)
    const distanceMoved = Math.sqrt(dx * dx + dz * dz);

    // Calculate speed
    const bps = distanceMoved / timeElapsedInSeconds;

    return bps;
}

function speeda(id) {
    // Get Dynamic Property
    const speedABoolean = dynamicPropertyRegistry.get("speeda_b");

    // Unsubscribe if disabled in-game
    if (speedABoolean === false) {
        playerData.clear();
        world.afterEvents.playerSpawn.unsubscribe(onPlayerSpawn);
        world.afterEvents.entityHurt.unsubscribe(onEntityHurt);
        world.afterEvents.playerLeave.unsubscribe(onPlayerLogout);
        system.clearRun(id);
        return;
    }

    const filter = {
        excludeGameModes: [GameMode.creative, GameMode.spectator],
    };
    // Exclude creative mode and spectator mode
    const filteredPlayers = world.getPlayers(filter);
    for (const player of filteredPlayers) {
        // Get unique ID
        const uniqueId = dynamicPropertyRegistry.get(player?.id);

        // Skip if they have permission
        if (uniqueId === player.name) {
            continue;
        }

        const glideCheck = player.isGliding;
        if (glideCheck) {
            continue;
        }

        const rideCheck = player.hasTag("riding");
        if (rideCheck) {
            continue;
        }

        const playerName = player.id;
        const playerPosition = [player.location.x, player.location.y, player.location.z];
        const playerTimestamp = Date.now();

        // If playerData Map doesn't have a key for the player's name, add it with initial values
        if (!playerData.has(playerName)) {
            playerData.set(playerName, {
                lastPosition: playerPosition,
                lastTimestamp: playerTimestamp,
                highestBps: 0,
                lastHitTimestamp: 0,
            });
        }

        const playerInfo = playerData.get(playerName);
        const { lastPosition, lastTimestamp, highestBps, lastHitTimestamp } = playerInfo;

        // Check if player was hit recently (within the last X milliseconds)
        const timeSinceLastHit = Date.now() - lastHitTimestamp;
        const recentlyHit = timeSinceLastHit <= 1000; // Adjust the time threshold as needed

        // Skip processing for players who were recently hit
        if (recentlyHit) {
            continue;
        }

        const bps = calculateMovementBPS(playerPosition, lastPosition, playerTimestamp, lastTimestamp);
        playerInfo.lastPosition = playerPosition;
        playerInfo.lastTimestamp = playerTimestamp;
        playerInfo.highestBps = Math.max(bps, highestBps);

        const verifyTpGrace = isTimerExpired(player.id);
        // We compare with a 20% buffer to minimize false flags
        if (!isNaN(playerInfo.highestBps) && playerInfo.highestBps > config.modules.speedA.speed && verifyTpGrace === true) {
            flag(player, "Speed", "A", "Movement", null, null, "IllegalSpeed", playerInfo.highestBps.toFixed(2), true);
            playerInfo.highestBps = 0;
        }
    }
    return;
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function SpeedA() {
    world.afterEvents.playerSpawn.subscribe(onPlayerSpawn);
    world.afterEvents.entityHurt.subscribe(onEntityHurt);
    world.afterEvents.playerLeave.subscribe(onPlayerLogout); // Subscribe to player logout events
    const speedAId = system.runInterval(() => {
        speeda(speedAId);
    }, 10);
}