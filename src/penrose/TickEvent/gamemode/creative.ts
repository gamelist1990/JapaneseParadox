import { world, EntityQueryOptions, GameMode, system } from "@minecraft/server";
import { sendMsg } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import { ScoreManager } from "../../../classes/ScoreManager.js";
import ConfigInterface from "../../../interfaces/Config.js";

async function creative(id: number) {
    // Get Dynamic Property
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const adventureGMBoolean = configuration.modules.adventureGM.enabled;
    const creativeGMBoolean = configuration.modules.creativeGM.enabled;
    const survivalGMBoolean = configuration.modules.survivalGM.enabled;

    // Unsubscribe if disabled in-game
    if (creativeGMBoolean === false) {
        system.clearRun(id);
        return;
    }
    const filter: EntityQueryOptions = {
        gameMode: GameMode.creative,
    };
    const filteredPlayers = world.getPlayers(filter);
    // Run as each player
    for (const player of filteredPlayers) {
        // Get unique ID
        const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

        // Skip if they have permission
        if (uniqueId === player.name) {
            continue;
        }
        // Make sure they didn't enable all of them in config.js as this will have a negative impact
        if (survivalGMBoolean === true && adventureGMBoolean === true) {
            // Default to adventure for safety
            configuration.modules.adventureGM.enabled = false;
            dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        }
        // Are they in creative? Fix it.
        if (survivalGMBoolean === true && adventureGMBoolean === false) {
            // Adventure is allowed so set them to adventure
            player.runCommandAsync(`gamemode a`);
        }
        if (survivalGMBoolean === false && adventureGMBoolean === true) {
            // Survival is allowed so set them to survival
            player.runCommandAsync(`gamemode survival`);
        }
        // If both are allowed then default to survival
        if (survivalGMBoolean === false && adventureGMBoolean === false) {
            // Survival is allowed so set them to survival
            player.runCommandAsync(`gamemode survival`);
        }
        ScoreManager.setScore(player, "gamemodevl", 1, true);
        sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f ${player.name}§6がゲームモードを変更しようとした §7(Gamemode_C)§6.§4 VL= ${ScoreManager.getScore("gamemodevl", player)}`);
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function Creative() {
    const creativeId = system.runInterval(() => {
        creative(creativeId).catch((error) => {
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
    }, 20);
}
