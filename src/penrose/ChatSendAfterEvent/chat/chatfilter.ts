import { world } from "@minecraft/server";
import { sendMsg } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import { ChatChannelManager } from "../../../classes/ChatChannelManager.js";
import { WorldExtended } from "../../../classes/WorldExtended/World.js";
import ConfigInterface from "../../../interfaces/Config.js";

const afterChatFilter = () => {
    // Subscribe to the 'afterChat' event
    world.afterEvents.chatSend.subscribe((msg) => {
        // Destructure 'message' and 'sender' properties from the 'msg' object
        const { message, sender: player } = msg;

        // Retrieve the 'chatranks_b' dynamic property
        const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
        const chatRanksBoolean = configuration.modules.chatranks.enabled;

        // Get the channel name associated with the player
        const channelName = ChatChannelManager.getPlayerChannel(player.id);

        if (chatRanksBoolean === true) {
            // Format the chat message
            const formattedMessage = (world as WorldExtended).decryptString(message, player.id);
            msg.message = formattedMessage;

            // Set 'sendToTargets' flag to false
            msg.sendToTargets = false;

            if (!msg.sendToTargets) {
                /**
                if (configuration.customcommands.tpr) {
                    // Array for tpr
                    const keywords = ["approve", "approved", "deny", "denied"];

                    // Extracting the custom message part
                    const messageParts = msg.message.split("§r");
                    const extractedMessage = messageParts.length > 1 ? messageParts[1] : "";

                    // Split the extracted message into words
                    const words = extractedMessage.trim().toLowerCase().split(" ");

                    // Check if the extracted message contains exactly one of the keywords and no extra words
                    const isMatch = words.length === 1 && keywords.includes(words[0]);
                    if (isMatch) {
                        return;
                    }
                }
                 */

                if (channelName) {
                    // Retrieve player objects of members in the same channel
                    const channelMembers = ChatChannelManager.getChatChannelByName(channelName).members;
                    const targetPlayers = [];

                    // Iterate through channel members
                    for (const memberID of channelMembers) {
                        const player = (world as WorldExtended).getPlayerById(memberID);
                        if (player !== null) {
                            targetPlayers.push(player.name);
                        }
                    }

                    // Send the formatted chat message to target players
                    if (targetPlayers.length > 0) {
                        sendMsg(targetPlayers, formattedMessage);

                        // Clear targetPlayers array after use
                        targetPlayers.length = 0;
                    }
                } else {
                    sendMsg("@a", formattedMessage);
                }

                // Set 'sendToTargets' flag to true
                msg.sendToTargets = true;
            }

            return;
        }

        // Process chat message when 'chatRanksBoolean' is false
        if (channelName) {
            // Set 'sendToTargets' flag to false
            msg.sendToTargets = false;

            // Format the chat message
            const formattedMessage = (world as WorldExtended).decryptString(message, player.id);
            msg.message = formattedMessage;

            // Retrieve player objects of members in the same channel
            const channelMembers = ChatChannelManager.getChatChannelByName(channelName).members;
            const targetPlayers = [];

            // Iterate through channel members
            for (const memberID of channelMembers) {
                const player = (world as WorldExtended).getPlayerById(memberID);
                if (player !== null) {
                    targetPlayers.push(player.name);
                }
            }

            // Send the formatted chat message to target players
            if (targetPlayers.length > 0) {
                sendMsg(targetPlayers, formattedMessage);

                // Clear targetPlayers array after use
                targetPlayers.length = 0;
            }

            // Set 'sendToTargets' flag to true
            msg.sendToTargets = true;
        }
    });
};

export { afterChatFilter };
