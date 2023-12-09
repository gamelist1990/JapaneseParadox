import { ChatSendAfterEvent, world } from "@minecraft/server";
import { flag } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../../interfaces/Config.js";

function spammerb(msg: ChatSendAfterEvent) {
    // Get Dynamic Property
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const spammerBBoolean = configuration.modules.spammerB.enabled;

    // Unsubscribe if disabled in-game
    if (spammerBBoolean === false) {
        world.afterEvents.chatSend.unsubscribe(spammerb);
        return;
    }
    const player = msg.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Skip if they have permission
    if (uniqueId === player.name) {
        return;
    }

    // Spammer/B = checks if someone sends a message while swinging their hand
    if (player.hasTag("left")) {
        flag(player, "Spammer", "B", "Combat", null, null, null, null, false);
    }
}

const SpammerB = () => {
    world.afterEvents.chatSend.subscribe(spammerb);
};

export { SpammerB };
