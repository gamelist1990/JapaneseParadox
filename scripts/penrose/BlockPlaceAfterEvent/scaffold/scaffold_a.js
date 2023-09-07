import { world, MinecraftBlockTypes,  system, } from "@minecraft/server";
import { flag } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";

function freeze(id) {
    const antiScaffoldABoolean = dynamicPropertyRegistry.get("antiscaffolda_b");
    if (antiScaffoldABoolean === false) {
        system.clearRun(id);
        return;
    }

    const filter = {
        tags: ["freezeScaffoldA"],
        excludeTags: ["freezeAura", "freezeNukerA"],
    };
    const players = world.getPlayers(filter);
    for (const player of players) {
        if (!player) {
            return;
        }
        const tagBoolean = player.hasTag("paradoxFreeze");
        if (!tagBoolean) {
            player.removeTag("freezeScaffoldA");
            return;
        }
        player.onScreenDisplay.setTitle("§f§4[§6Paradox§4]§f Frozen!", { subtitle: "§fContact Staff §4[§6AntiScaffoldA§4]§f", fadeInDuration: 0, fadeOutDuration: 0, stayDuration: 60 });
    }
}

function isBlockInFrontAndBelowPlayer(blockLocation, playerLocation) {
    // Calculate the difference in coordinates between the block and player
    const dx = blockLocation.x - playerLocation.x;
    const dy = blockLocation.y - playerLocation.y;
    const dz = blockLocation.z - playerLocation.z;

    // You can adjust these thresholds based on your requirements
    // For example, you might want to consider a block in front and below if it's within a certain range.
    const xThreshold = 1.0;
    const yThreshold = -0.5; // Consider the block below and front if it's a certain distance between the player
    const zThreshold = -0.5;

    return dx <= xThreshold && dy >= yThreshold && dy <= yThreshold && dz >= zThreshold;
}

async function scaffolda(object) {
    // Get Dynamic Property
    const antiScaffoldABoolean = dynamicPropertyRegistry.get("antiscaffolda_b");
    // Unsubscribe if disabled in-game
    if (antiScaffoldABoolean === false) {
        world.afterEvents.blockPlace.unsubscribe(scaffolda);
        return;
    }

    // Properties from class
    const { block, player, dimension } = object;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Skip if they have permission
    if (uniqueId === player.name) {
        return;
    }

    // Cache player location
    const playerLocation = player.location;

    // Cache block location
    const blockLocation = block.location;

    // Check if the block is in front and below the player
    if (isBlockInFrontAndBelowPlayer(blockLocation, playerLocation)) {
        // Check rotation and validate if its an integer and not a float
        const rot = player.getRotation();

        if (rot.x % 1 === 0) {
            dimension.getBlock(blockLocation).setType(MinecraftBlockTypes.air);
            flag(player, "Scaffold", "A", "Placement", null, null, null, null, false);
        }
    }
}

const ScaffoldA = () => {
    world.afterEvents.blockPlace.subscribe((object) => {
        scaffolda(object).catch((error) => {
            console.error("Paradox Unhandled Rejection: ", error);
            // Extract stack trace information
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("Error originated from:", sourceInfo[0]);
                }
            }
        });
    });
    const id = system.runInterval(() => {
        freeze(id);
    }, 20);
};

export { ScaffoldA };