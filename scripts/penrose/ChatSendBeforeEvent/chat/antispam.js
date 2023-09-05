import { world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../../util.js";
const spamTime = 2 * 1000; // The time frame during which the player's messages will be counted.
const offenseCount = 5; // Total strikes until you are kicked out.
const strikeReset = 30 * 1000; // The time frame until the strike is reduced
const lastChanceWarning = "この行為を続けるとBANされます！！";
const warningMessages = [
    "早すぎるメッセージの送信はお控えください",
    "あまり頻繁にメッセージを送ると、混乱が生じる可能性があります",
    "チャットの品質を維持するため、メッセージ送信のペースを落としてください。",
    "急激なメッセージ送信は一時的な制限につながる可能性があります。",
    "迅速なメッセージでチャットをスパムすることは避けてください、",
    "メッセージとメッセージの間に時間を置くことを忘れないでください",
    "過度のメッセージ送信速度はチャットの制限につながる可能性があります",
    "チャットの使用中は適度なペースを保ちましょう、",
    "チャットの読みやすさを保つために、メッセージの送信には配慮しましょう、",
    "早すぎるメッセージは制限される可能性があることを心に留めておいてください。",
];
const chatRecords = new Map();
function onPlayerLogout(event) {
    // Remove the player's data from the map when they log off
    const playerName = event.playerId;
    chatRecords.delete(playerName);
}
function getRandomWarningMessage() {
    const randomIndex = Math.floor(Math.random() * warningMessages.length);
    return warningMessages[randomIndex];
}
function beforeantispam(msg) {
    // Get Dynamic Property
    const antiSpamBoolean = dynamicPropertyRegistry.get("antispam_b");
    // Unsubscribe if disabled in-game
    if (antiSpamBoolean === false) {
        chatRecords.clear();
        world.afterEvents.playerLeave.unsubscribe(onPlayerLogout);
        world.beforeEvents.chatSend.unsubscribe(beforeantispam);
        return;
    }
    // Store player object
    const player = msg.sender;
    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
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
        }
        else if (now !== chatRecord.lastTime) {
            // Send a random warning message
            if (chatRecord.offense === offenseCount - 2) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${lastChanceWarning}`);
            }
            else {
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
        }
        else if (chatRecord.offense > 0 && now - chatRecord.lastOffenseTime >= strikeReset) {
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
