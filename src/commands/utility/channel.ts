import { ChatSendAfterEvent, Player, PlayerLeaveAfterEvent, world } from "@minecraft/server";
import { createChatChannel, inviteToChatChannel, getPrefix, sendMsgToPlayer, switchChatChannel, deleteChatChannel, handOverChannelOwnership, getPlayerChannel, chatChannels, getPlayerById, playerChannelMap, getPlayerByName } from "../../util.js";
import config from "../../data/config.js";

function chatChannelHelp(player: Player, prefix: string) {
    let commandStatus: string;
    if (!config.customcommands.channel) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Chat Channel Commands§4]§f:`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel create <channelName> <password?>`,
        `§4[§6Description§4]§f: Create a new chat channel (with optional password).`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}channel create test`,
        `        §4- §6Create a chat channel named 'test' without a password§f`,
        `    ${prefix}channel create test password123`,
        `        §4- §6Create a chat channel named 'test' with password 'password123'§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel delete <channelName> <password?>`,
        `§4[§6Description§4]§f: Delete an existing chat channel (with optional password).`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}channel delete test`,
        `        §4- §6Delete the chat channel named 'test'§f`,
        `    ${prefix}channel delete test password123`,
        `        §4- §6Delete the chat channel named 'test' with password 'password123'§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel invite <channelName> <playerName>`,
        `§4[§6Description§4]§f: Invite a player to join your chat channel.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}channel invite test player123`,
        `        §4- §6Invite 'player123' to join the chat channel 'test'§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel join <channelName> <password?>`,
        `§4[§6Description§4]§f: Join a chat channel (with optional password).`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}channel join test`,
        `        §4- §6Join the chat channel 'test'§f`,
        `    ${prefix}channel join test password123`,
        `        §4- §6Join the chat channel 'test' with password 'password123'§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel handover <channelName> <playerName>`,
        `§4[§6Description§4]§f: Transfer ownership of a chat channel.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}channel handover test newOwner123`,
        `        §4- §6Transfer ownership of the chat channel 'test' to 'newOwner123'§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel members`,
        `§4[§6Description§4]§f: List all members in the same chat channel.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}channel members`,
        `        §4- §6List all members in the same chat channel§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel leave`,
        `§4[§6Description§4]§f: Leave the current chat channel.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}channel leave`,
        `        §4- §6Leave the current chat channel§f`,
    ]);
}

export function chatChannel(message: ChatSendAfterEvent, args: string[]) {
    if (!message) {
        console.warn(`${new Date()} | Error: ${message} isn't defined.`);
        return;
    }

    const player = message.sender;
    const prefix = getPrefix(player);

    const commandArgs = args;

    if (commandArgs[0] !== "me" && commandArgs[0] !== "le" && (commandArgs[0] === "help" || commandArgs.length < 2)) {
        chatChannelHelp(player, prefix);
        return;
    }

    const subCommand = commandArgs[0]; // Extract the subcommand
    const subCommandArgs = commandArgs.slice(1); // Extract the subcommand arguments

    switch (subCommand) {
        case "me": {
            const channelNameForMembers = getPlayerChannel(player.id);

            if (!channelNameForMembers) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f あなたはどのチャットチャンネルにも入っていません.`);
                return;
            }

            const channel = chatChannels[channelNameForMembers];
            const channelMembers = channel.members;

            const memberListTitle = `§f§4[§6Paradox§4]§f 全メンバーとチャンネル一覧＝＞ §6${channelNameForMembers}§f`;
            const membersList = Array.from(channelMembers)
                .map((memberID) => {
                    const member = getPlayerById(memberID);
                    if (member !== null) {
                        const isStatus = member.id === channel.owner ? "所有者" : "メンバー";
                        return ` §o§6| §4[§6${isStatus}§4] §7${member.name}§f`;
                    }
                    return "";
                })
                .filter((memberLine) => memberLine !== "")
                .join("\n");

            sendMsgToPlayer(player, [memberListTitle, membersList]);
            break;
        }

        case "cr": {
            const existingChannelName = getPlayerChannel(player.id);

            if (existingChannelName) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f すでにチャットチャンネルに入っています！ 参加チャンネル＝＞ (${existingChannelName}). まずは今いるチャンネルから抜けてください`);
            } else {
                const channelName = subCommandArgs[0];
                const password = subCommandArgs[1]; // Optional password argument

                const createResult = createChatChannel(channelName, password, player.id);
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f チャンネル＝＞ '${channelName}' ${createResult ? "作成." : "既に作成済み"}`);
            }
            break;
        }

        case "de": {
            const channelNameToDelete = subCommandArgs[0];
            const passwordToDelete = subCommandArgs[1]; // Optional password argument

            const deleteResult = deleteChatChannel(channelNameToDelete, passwordToDelete);

            if (deleteResult === "wrong_password") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fパスワードが違います '${channelNameToDelete}'.`);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f チャンネル＝＞ '${channelNameToDelete}' ${deleteResult ? "消去." : "見つかりませんでした."}`);
            }
            break;
        }

        case "in": {
            const channelNameToInvite = subCommandArgs[0];
            const playerToInvite = subCommandArgs[1];

            if (!playerToInvite) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Usage: ${prefix}channel invite <channelName> <playerName>`);
                return;
            }

            const joinedPlayer = getPlayerByName(playerToInvite);

            if (playerToInvite) {
                const inviteResult = inviteToChatChannel(playerToInvite, channelNameToInvite);
                if (inviteResult) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${playerToInvite}を招待しました 招待したチャンネル＝＞ '${channelNameToInvite}'.`);
                    const joinedPlayerName = joinedPlayer ? joinedPlayer.name : "不明なプレイヤー";

                    const joinMessage = `§f§4[§6Paradox§4]§f §6${joinedPlayerName}§f チャンネルに参加しました.`;
                    const channel = chatChannels[channelNameToInvite];

                    channel.members.forEach((memberId) => {
                        const member = getPlayerById(memberId);
                        if (member && member !== joinedPlayer) {
                            sendMsgToPlayer(member, joinMessage);
                        }
                    });

                    sendMsgToPlayer(joinedPlayer, `§f§4[§6Paradox§4]§f ${player.name} からあなたに '${channelNameToInvite}'のチャンネルに招待されています`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${playerToInvite} は既にチャンネルに参加しています`);
                }
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '${playerToInvite}' が見つかりませんでした`);
            }
            break;
        }

        case "join": {
            const channelNameToJoin = subCommandArgs[0];
            const passwordToJoin = subCommandArgs[1]; // Optional password argument

            const newChannel = switchChatChannel(player.id, channelNameToJoin, passwordToJoin);

            if (newChannel === "wrong_password") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fパスワードが違います '${channelNameToJoin}'.`);
            } else if (newChannel === "already_in_channel") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f すでにチャットチャンネルに入っています！  消す又は抜けてから入ってね`);
            } else if (newChannel !== false) {
                const joinedPlayer = getPlayerById(player.id);
                const joinedPlayerName = joinedPlayer ? joinedPlayer.name : "不明なプレイヤー";

                const joinMessage = `§f§4[§6Paradox§4]§f §6${joinedPlayerName}§fチャンネルに参加しました.`;
                const channel = chatChannels[channelNameToJoin];

                channel.members.forEach((memberId) => {
                    const member = getPlayerById(memberId);
                    if (member && member !== joinedPlayer) {
                        sendMsgToPlayer(member, joinMessage);
                    }
                });

                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '${channelNameToJoin}'に参加しました`);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 何かしらの原因で参加できませんでした`);
            }
            break;
        }

        case "handover": {
            const channelNameToHandOver = subCommandArgs[0];
            const newOwnerName = subCommandArgs[1];

            const handOverResult = handOverChannelOwnership(channelNameToHandOver, player, newOwnerName);

            if (handOverResult === "not_owner") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f あなたはチャットチャンネルの所有者ではありません '${channelNameToHandOver}'.`);
            } else if (handOverResult === "target_not_found") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '${newOwnerName}' が見つかりません`);
            } else if (handOverResult) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f チャットチャンネルの所有権が '${channelNameToHandOver}'から  '${newOwnerName}'に譲渡されました`);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f チャットチャネルの所有権を移行できません`);
            }
            break;
        }

        case "le": {
            const channelNameToLeave = getPlayerChannel(player.id);

            if (!channelNameToLeave) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f あなたはどのチャットチャンネルにもいない.`);
                return;
            }

            const channelToLeave = chatChannels[channelNameToLeave];
            const isOwner = channelToLeave.owner === player.id;

            // Remove the player from the channel
            channelToLeave.members.delete(player.id);
            playerChannelMap[player.id] = null;

            // Inform all remaining members in the channel that the player left
            const leavingPlayer = getPlayerById(player.id);
            const leavingPlayerName = leavingPlayer ? leavingPlayer.name : "不明なプレイヤー";
            const leaveMessage = `§f§4[§6Paradox§4]§f §6${leavingPlayerName}§f がチャンネルから抜けた`;

            channelToLeave.members.forEach((memberId) => {
                const member = getPlayerById(memberId);
                if (member) {
                    sendMsgToPlayer(member, leaveMessage);
                }
            });

            if (isOwner) {
                // If the leaving player is the owner, transfer ownership to another member
                const newOwnerId = Array.from(channelToLeave.members)[0]; // Get the first member as new owner

                if (newOwnerId) {
                    handOverChannelOwnership(channelNameToLeave, getPlayerById(player.id), getPlayerById(newOwnerId).name);
                    const newOwnerObject = getPlayerById(newOwnerId);
                    sendMsgToPlayer(newOwnerObject, `§f§4[§6Paradox§4]§f チャットチャンネルの所有権が '${channelNameToLeave}' から '${newOwnerObject.name}'に譲渡された。`);
                } else {
                    // If no other members, delete the channel
                    deleteChatChannel(channelNameToLeave, channelToLeave.password);
                }
            }

            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '${channelNameToLeave}'から抜けました！`);
            break;
        }

        default:
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 不明なチャットチャネルコマンド  '${prefix}channel help' コマンドのヘルプを表示する`);
            break;
    }
}

// Define a callback function to handle the playerLeave event
function onPlayerLeave(event: PlayerLeaveAfterEvent) {
    const playerId = event.playerId;
    const channelName = getPlayerChannel(playerId);

    if (!channelName) {
        return; // Player wasn't in any channel
    }

    const channel = chatChannels[channelName];

    if (channel.owner === playerId) {
        // If the leaving player is the owner, transfer ownership to another member
        const newOwnerId = Array.from(channel.members).find((memberId) => memberId !== playerId);

        if (newOwnerId) {
            handOverChannelOwnership(channelName, getPlayerById(playerId), newOwnerId);
            const newOwnerObject = getPlayerById(newOwnerId);
            sendMsgToPlayer(newOwnerObject, `§f§4[§6Paradox§4]§fチャットチャンネルの所有権が '${channelName}' から '${newOwnerObject.name}'に譲渡された`);
        } else {
            // If no other members, delete the channel
            deleteChatChannel(channelName, channel.password);
            return;
        }
    }

    // Remove the player from the channel
    channel.members.delete(playerId);
    playerChannelMap[playerId] = null;

    // Inform all remaining members in the channel that the player left
    const leavingPlayer = getPlayerById(playerId);
    const leavingPlayerName = leavingPlayer ? leavingPlayer.name : "Unknown Player";

    const leaveMessage = `§f§4[§6Paradox§4]§f §6${leavingPlayerName}§f チャンネルから抜けた.`;
    channel.members.forEach((memberId) => {
        const member = getPlayerById(memberId);
        if (member) {
            sendMsgToPlayer(member, leaveMessage);
        }
    });
}

const onChannelLeave = () => {
    // Subscribe the callback function to the playerLeave event
    world.afterEvents.playerLeave.subscribe(onPlayerLeave);
};

export { onChannelLeave };
