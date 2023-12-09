import { ChatSendBeforeEvent, PlayerLeaveAfterEvent, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../../util.js";
import ConfigInterface from "../../../interfaces/Config.js";

const spamTime = 2 * 1000; // The time frame during which the player's messages will be counted.
const offenseCount = 5; // Total strikes until you are kicked out.
const strikeReset = 30 * 1000; // The time frame until the strike is reduced
const lastChanceWarning = "最終警告: 迅速なメッセージ送信を続けると、禁止されます。";

const warningMessages = [
    "早口でのメッセージ送信はお控えください.",
    "メッセージの頻度が高すぎると、混乱が生じる可能性があります.",
    "チャットの品質を維持するために、メッセージングのペースを遅くします。",
    "メッセージをすばやく送信すると、一時的な制限が発生する場合があります.",
    "クイックメッセージでチャットをスパムしないようにする.",
    "メッセージとメッセージの間には、ある程度の時間を確保してください.",
    "メッセージの速度が速すぎると、チャットが制限される可能性があります.",
    "チャットを使用している間、適度なペースを維持する.",
    "メッセージを送信してチャットを読みやすくするのを手伝ってください .",
    "メッセージの送信が速すぎると、制限される可能性があることに注意してください.",
];

interface ChatRecord {
    count: number;
    lastTime: number;
    offense: number;
    lastOffenseTime: number;
}

const chatRecords = new Map<string, ChatRecord>();

function getRegistry() {
    return dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
}

function onPlayerLogout(event: PlayerLeaveAfterEvent): void {
    // Remove the player's data from the map when they log off
    const playerName = event.playerId;
    chatRecords.delete(playerName);

    const configuration = getRegistry();

    if (!configuration.modules.antispam.enabled) {
        // Unsubscribe from the playerLeave event
        world.afterEvents.playerLeave.unsubscribe(onPlayerLogout);
    }
}

function getRandomWarningMessage() {
    const randomIndex = Math.floor(Math.random() * warningMessages.length);
    return warningMessages[randomIndex];
}

function beforeantispam(msg: ChatSendBeforeEvent) {
    // Get Dynamic Property
    const configuration = getRegistry();
    const antiSpamBoolean = configuration.modules.antispam.enabled;

    // Unsubscribe if disabled in-game
    if (antiSpamBoolean === false) {
        chatRecords.clear();
        world.beforeEvents.chatSend.unsubscribe(beforeantispam);
        return;
    }

    // Store player object
    const player = msg.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Ignore those with permissions
    if (uniqueId !== player.name) {
        const now = Date.now();
        let chatRecord = chatRecords.get(player.id);

        if (!chatRecord) {
            // Initialize a new chat record for the player
            chatRecord = { count: 0, lastTime: now, offense: 0, lastOffenseTime: now };
            chatRecords.set(player.id, chatRecord);
            chatRecord = chatRecords.get(player.id);
        }

        if (now - chatRecord.lastTime > spamTime) {
            // Reset count if time frame has expired
            chatRecord.count = 0;
        } else if (now !== chatRecord.lastTime) {
            // Send a random warning message
            if (chatRecord.offense === offenseCount - 2) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${lastChanceWarning}`);
            } else {
                const randomWarningMessage = getRandomWarningMessage();
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${randomWarningMessage}`);
            }
            msg.sendToTargets = true;
            chatRecord.offense++;
            chatRecord.lastOffenseTime = now;
        }

        chatRecord.count++;
        chatRecord.lastTime = now;

        chatRecords.set(player.id, chatRecord);

        if (chatRecord.offense >= offenseCount) {
            msg.sendToTargets = true;
            chatRecords.delete(player.id);
            // Add tag information to the message
            msg.message = `;tag:${player.name},Reason:Spamming,By:Paradox,isBanned`;
        } else if (chatRecord.offense > 0 && now - chatRecord.lastOffenseTime >= strikeReset) {
            chatRecord.offense--;
            chatRecord.lastOffenseTime = now;
        }
    }
}

const beforeAntiSpam = () => {
    world.afterEvents.playerLeave.subscribe(onPlayerLogout);
    world.beforeEvents.chatSend.subscribe(beforeantispam);
};

export { beforeAntiSpam };
