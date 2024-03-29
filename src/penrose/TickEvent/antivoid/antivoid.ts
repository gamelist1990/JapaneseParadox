import { world, EntityQueryOptions, GameMode, system } from "@minecraft/server";
//import { flag } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
let savedValue: number;
let flagPlayer: boolean = false;
let isFlying: boolean = false;
// eslint-disable-next-line
function antiVoid(_id: number) {
    //exclude players who are in creative.
    const gm: EntityQueryOptions = {
        excludeGameModes: [GameMode.creative, GameMode.spectator],
    };
    const filteredPlayers = world.getPlayers(gm);

    for (const player of filteredPlayers) {
        // Get unique ID
        const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);
        // Skip if they have permission
        if (uniqueId === player.name) {
            continue;
        }

        let lastFallingCord;
        let lastSavedCord;
        if (player.isFalling == true) {
            lastFallingCord = player.location.y;
            saveOrGetValue("save", lastFallingCord);
            flagPlayer = false;
            isFlying = false;
            console.log(lastFallingCord);
        }
        if (player.isFlying) {
            isFlying = true;
        }
        if (player.isOnGround == true) {
            // @ts-expect-error testing
            lastSavedCord = saveOrGetValue("get");
            if (player.location.y - lastSavedCord >= 3 && isFlying == false) {
                if (flagPlayer == false) {
                    console.log("Player has been flagged for AntiVoid Expliot");
                    flagPlayer = true;
                }
            }
        }
    }
    // @ts-expect-error testing
    function saveOrGetValue(action: string, value: number) {
        if (action === "save") {
            // Save the value
            savedValue = value;
        } else if (action === "get") {
            // Retrieve the saved value
            return savedValue;
        } else {
            // Handle invalid action
            console.error('Invalid action. Use "save" or "get".');
        }
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function antiVoida() {
    const antiVoidId = system.runInterval(() => {
        antiVoid(antiVoidId);
    }, 5);
}
