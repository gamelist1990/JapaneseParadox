import { world, system, Vector } from "@minecraft/server";
import { decryptString, encryptString, sendMsg, setTimer } from "../../../util";
import { MinecraftEffectTypes } from "../../../node_modules/@minecraft/vanilla-data/lib/index";
function freezePlayer(player) {
    // Record the player's original location
    const originalLocation = player.location;
    const originalDimension = player.dimension.id;
    setTimer(player.id);
    // Teleport the player to the freezing location
    player.teleport(new Vector(originalLocation.x, 245, originalLocation.z), {
        dimension: world.getDimension("overworld"),
        rotation: player.getRotation(),
        facingLocation: player.getViewDirection(),
        checkForBlocks: false,
        keepVelocity: false,
    });
    // Create prison around the player
    player.runCommand(`fill ${originalLocation.x + 2} ${245 + 2} ${originalLocation.z + 2} ${originalLocation.x - 2} ${245 - 1} ${originalLocation.z - 2} barrier [] hollow`);
    // Encrypt the data
    const encryptData = encryptString(`${originalLocation.x},${originalLocation.y},${originalLocation.z},${originalDimension.replace("minecraft:", "")}`, player.id);
    // Store original location and dimension in a tag
    player.addTag(`paradoxFreezeData:${encryptData}`);
}
function unfreezePlayer(player) {
    if (!player) {
        return; // Player object is undefined or null
    }
    // Retrieve the tag
    const freezeTag = player.getTags().find((tag) => tag.startsWith("paradoxFreezeData:"));
    if (freezeTag) {
        // Decrypt data
        const decryptData = decryptString(freezeTag.replace("paradoxFreezeData:", ""), player.id);
        const freezeTagDecrypt = `paradoxFreezeData:${decryptData}`;
        // Parse the tag to extract location and dimension information
        const tagParts = freezeTagDecrypt.split(":");
        if (tagParts.length === 2) {
            const locationAndDimension = tagParts[1].split(",");
            if (locationAndDimension.length === 4) {
                const originalX = parseFloat(locationAndDimension[0]);
                const originalY = parseFloat(locationAndDimension[1]);
                const originalZ = parseFloat(locationAndDimension[2]);
                const originalDimensionName = locationAndDimension[3];
                player.removeTag(freezeTag);
                // Remove the prison blocks
                player.runCommand(`fill ${originalX + 2} ${245 + 2} ${originalZ + 2} ${originalX - 2} ${245 - 1} ${originalZ - 2} air [] hollow`);
                setTimer(player.id);
                // Teleport the player back to their original location
                player.teleport(new Vector(originalX, originalY, originalZ), {
                    dimension: world.getDimension(originalDimensionName),
                    rotation: player.getRotation(),
                    facingLocation: player.getViewDirection(),
                    checkForBlocks: false,
                    keepVelocity: false,
                });
            }
        }
    }
}
// Function to periodically check and freeze players
const freezePlayers = () => {
    const filter = {
        tags: ["paradoxFreeze"],
    };
    const players = world.getPlayers(filter);
    for (const player of players) {
        const hasFreezeTag = player.hasTag("paradoxFreeze");
        const hasAuraTag = player.hasTag("freezeAura");
        const hasNukerTag = player.hasTag("freezeNukerA");
        if (!hasFreezeTag) {
            // Player doesn't have the freeze tag, unfreeze them
            unfreezePlayer(player);
        }
        else {
            // Player has the freeze tag, freeze or update them
            let freezeDataTag = player.getTags().find((tag) => tag.startsWith("paradoxFreezeData:"));
            if (freezeDataTag) {
                // Decrypt data
                const decryptData = decryptString(freezeDataTag.replace("paradoxFreezeData:", ""), player.id);
                freezeDataTag = `paradoxFreezeData:${decryptData}`;
                // Process data
                const freezeData = freezeDataTag.split(":")[1];
                const [originalX, originalY, originalZ, originalDimension] = freezeData.split(",").map((value, index) => (index === 3 ? value : parseFloat(value)));
                // Check if the player has moved and teleport if necessary
                const { x, y, z } = player.location;
                if (Math.floor(x) !== Math.floor(originalX) || Math.floor(y) !== Math.floor(originalY) || Math.floor(z) !== Math.floor(originalZ) || player.dimension.id !== originalDimension) {
                    player.teleport(new Vector(originalX, originalY, originalZ), {
                        dimension: world.getDimension(originalDimension),
                        rotation: player.getRotation(),
                        facingLocation: player.getViewDirection(),
                        checkForBlocks: false,
                        keepVelocity: false,
                    });
                }
                // Check and apply effects if not already present
                const effects = [MinecraftEffectTypes.Blindness, MinecraftEffectTypes.MiningFatigue, MinecraftEffectTypes.Weakness, MinecraftEffectTypes.Slowness];
                for (const typeEffect of effects) {
                    if (!player.getEffect(typeEffect)) {
                        player.addEffect(typeEffect, 1000000, { amplifier: 255, showParticles: true });
                    }
                }
            }
            else {
                // Player has the freeze tag but no freeze data tag, freeze them
                freezePlayer(player);
            }
            // Display custom message if both aura and nuker tags exist
            const title = hasAuraTag && hasNukerTag ? { subtitle: "§f検知内容＝＞ §4[§6KA§4]§f§4[§6NA§4]§f" } : { subtitle: "§f検知内容＝＞ §o§4[§6Command§4]§f" };
            player.onScreenDisplay.setTitle("§f§4[§6Paradox§4]§f 行動を禁止されました！!", {
                ...title,
                fadeInDuration: 0,
                fadeOutDuration: 0,
                stayDuration: 60,
            });
        }
    }
    // Unfreeze players who no longer have the "paradoxFreeze" tag
    const clearFilter = {
        excludeTags: ["paradoxFreeze"],
    };
    const clearPlayers = world.getPlayers(clearFilter);
    for (const player of clearPlayers) {
        if (!player.hasTag("paradoxFreeze")) {
            unfreezePlayer(player);
        }
    }
};
// Subscribe to the playerLeave event to handle frozen players leaving
export const freezeLeave = () => {
    world.afterEvents.playerLeave.subscribe((event) => {
        const playerId = event.playerId;
        const hasFreezeTag = world
            .getPlayers()
            .find((player) => player.id === playerId)
            ?.hasTag("paradoxFreeze");
        if (hasFreezeTag) {
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${event.playerName}§f 行動を禁止されたままワールドを離れました`);
        }
    });
};
// Subscribe to the playerJoin event to handle frozen players returning
export const freezeJoin = () => {
    world.afterEvents.playerJoin.subscribe((event) => {
        const playerId = event.playerId;
        const hasFreezeTag = world
            .getPlayers()
            .find((player) => player.id === playerId)
            ?.hasTag("paradoxFreeze");
        if (hasFreezeTag) {
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${event.playerName}§f は凍結され、サーバーに戻されました`);
        }
    });
};
// Run the freezePlayers function every 3 seconds
export const freeze = system.runInterval(freezePlayers, 60); // 20 ticks = 1 second
