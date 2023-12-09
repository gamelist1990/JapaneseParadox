import { ChatSendAfterEvent, world } from "@minecraft/server";
import { kickablePlayers } from "../../../kickcheck";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry";
import ConfigInterface from "../../../interfaces/Config";

function extractTagInfo(message: string) {
    const tagPrefix = ";tag:";
    const tagInfo = message.split(tagPrefix)[1];

    if (tagInfo) {
        const [playerName, reason, by, isBanned] = tagInfo.split(",");

        return {
            playerName,
            reason: reason.split(":")[1],
            by: by.split(":")[1],
            isBanned: isBanned === "isBanned" ? "isBanned" : undefined,
        };
    }

    return null;
}

function afterantispam(msg: ChatSendAfterEvent) {
    // Get Dynamic Property
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    const antiSpamBoolean = configuration.modules.antispam.enabled;

    // Unsubscribe if disabled in-game
    if (antiSpamBoolean === false) {
        world.afterEvents.chatSend.unsubscribe(afterantispam);
        return;
    }

    // Store player object
    const player = msg.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Ignore those with permissions
    if (uniqueId === player.name) {
        return;
    }

    // Extract tag information from the message
    const tagInfo = extractTagInfo(msg.message);

    // Check if the message contains tag information
    if (tagInfo && tagInfo.playerName === player.name) {
        // Add tags to the player
        try {
            player.addTag(`Reason:${tagInfo.reason}`);
            player.addTag(`By:${tagInfo.by}`);
            player.addTag(tagInfo.isBanned);
        } catch {
            kickablePlayers.add(player);
            player.triggerEvent("paradox:kick");
        }
    }
}

const afterAntiSpam = () => {
    world.afterEvents.chatSend.subscribe(afterantispam);
};

export { afterAntiSpam };
