import { Player, world, system } from "@minecraft/server";
import { flag } from "../../../util.js";
import { kickablePlayers } from "../../../kickcheck.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../../interfaces/Config.js";

function rip(player: Player) {
    // Tag with reason and by who
    try {
        player.addTag("Reason:Namespoof B (Disabler)");
        player.addTag("By:Paradox");
        player.addTag("isBanned");
        // Despawn if we cannot kick the player
    } catch (error) {
        kickablePlayers.add(player);
        player.triggerEvent("paradox:kick");
    }
}

function namespoofb(id: number) {
    // Get Dynamic Property
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const nameSpoofBoolean = configuration.modules.namespoofB.enabled;

    // Unsubscribe if disabled in-game
    if (nameSpoofBoolean === false) {
        system.clearRun(id);
        return;
    }
    // run as each player
    const players = world.getPlayers();
    for (const player of players) {
        // Get unique ID
        const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

        // Skip if they have permission
        if (uniqueId === player.name) {
            continue;
        }
        // Namespoof/B = regex check
        if (configuration.modules.namespoofB.banregex.test(player.name)) {
            player.nameTag = player.name.replace(configuration.modules.namespoofB.banregex, "");
            rip(player);
        } else if (configuration.modules.namespoofB.kickregex.test(player.name)) {
            player.nameTag = player.name.replace(configuration.modules.namespoofB.kickregex, "");
            flag(player, "Namespoof", "B", "Exploit", null, null, null, null, false);
        }
    }
    return;
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function NamespoofB() {
    const nameSpoofBId = system.runInterval(() => {
        namespoofb(nameSpoofBId);
    }, 40);
}
