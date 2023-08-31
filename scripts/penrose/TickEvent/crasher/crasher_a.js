import { world, system } from "@minecraft/server";
import { flag } from "../../../util.js";
import { kickablePlayers } from "../../../kickcheck.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
function crashera(id) {
    // Get Dynamic Property
    const crasherABoolean = dynamicPropertyRegistry.get("crashera_b");
    // Unsubscribe if disabled in-game
    if (crasherABoolean === false) {
        system.clearRun(id);
        return;
    }
    // run as each player
    const players = world.getPlayers();
    for (const player of players) {
        // Crasher/A = invalid pos check
        if (Math.abs(player.location.x) > 30000000 || Math.abs(player.location.y) > 30000000 || Math.abs(player.location.z) > 30000000) {
            flag(player, "Crasher", "A", "Exploit", null, null, null, null, true);
            try {
                player.addTag("Reason:Crasher");
                player.addTag("By:Paradox");
                player.addTag("isBanned");
            }
            catch (error) {
                kickablePlayers.add(player);
                player.triggerEvent("paradox:kick");
            }
        }
    }
}
/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function CrasherA() {
    const crasherAId = system.runInterval(() => {
        crashera(crasherAId);
    });
}
