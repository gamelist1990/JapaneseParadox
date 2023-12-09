import { ChatSendAfterEvent, Player, PlayerLeaveAfterEvent, world } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { ChatChannelManager } from "../../classes/ChatChannelManager.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function chatChannelHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6チャットチャネルコマンド§4]§f：`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel create <channelName> <password?>`,
        `§4[§6説明§4]§f：新しいチャットチャンネルを作成する(オプションのパスワード付き)。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}channel create test`,
        `        §パスワードなしで 'test' という名前のチャットチャンネルを作る§f`,
        `    ${prefix}channel create test password123`,
        `        §パスワード 'password123' で 'test' という名前のチャットチャンネルを作成する。`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel delete <channelName> <password?>`,
        `§4[§6説明§4]§f：既存のチャットチャンネルを削除する(オプションのパスワード付き)。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}channel delete test`,
        `        §4- §6「test」という名前のチャットチャンネルを削除する§f`,
        `    ${prefix}channel delete test password123`,
        `        §4- §6パスワード'password123'で'test'という名前のチャットチャンネルを削除する§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel invite <channelName> <playerName>`,
        `§4[§6説明§4]§f：チャットチャンネルにプレイヤーを招待する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}channel invite test player123`,
        `        §4- §6チャットチャンネル「test」に「player123」を招待する§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel join <channelName> <password?>`,
        `§4[§6説明§4]§f：チャットチャンネルに参加する(パスワードは任意)。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}channel join test`,
        `        §4- §6チャットチャンネル「test」に参加する§f`,
        `    ${prefix}channel join test password123`,
        `        §4- §6パスワード'password123'でチャットチャンネル'test'に参加する§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel handover <channelName> <playerName>`,
        `§4[§6解説§4]§f：チャットチャンネルの所有権を譲渡する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}channel handover test newOwner123`,
        `        §4- §6 チャットチャンネル 'test' の所有権を 'newOwner123' に移す§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel members`,
        `§4[§6説明§4]§f：同じチャットチャンネルにいるメンバー全員をリストアップする。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}channel members`,
        `        §4- §6同じチャットチャンネルにいるメンバーを一覧表示する§f`,
        ``,
        `§4[§6Command§4]§f: ${prefix}channel leave`,
        `§4[§6説明§4]§f：現在のチャットチャンネルから抜ける。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}channel leave`,
        `        §4- §6現在のチャットチャンネルから抜ける§f`,
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

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (commandArgs[0] !== "members" && commandArgs[0] !== "leave" && (commandArgs[0] === "help" || commandArgs.length < 2)) {
        chatChannelHelp(player, prefix, configuration.customcommands.channel);
        return;
    }

    const subCommand = commandArgs[0]; // Extract the subcommand
    const subCommandArgs = commandArgs.slice(1); // Extract the subcommand arguments

    switch (subCommand) {
        case "members": {
            const channelNameForMembers = ChatChannelManager.getPlayerChannel(player.id);

            if (!channelNameForMembers) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはどのチャットチャンネルにも入っていません。`);
                return;
            }

            const channel = ChatChannelManager.getChatChannelByName(channelNameForMembers);
            const channelMembers = channel.members;

            const memberListTitle = `§f§4[§6Paradox§4]§f Getting all Members from: §6${channelNameForMembers}§f`;
            const membersList = Array.from(channelMembers)
                .map((memberID) => {
                    const member = (world as WorldExtended).getPlayerById(memberID);
                    if (member !== null) {
                        const isStatus = member.id === channel.owner ? "Owner" : "Member";
                        return ` §o§6| §4[§6${isStatus}§4] §7${member.name}§f`;
                    }
                    return "";
                })
                .filter((memberLine) => memberLine !== "")
                .join("\n");

            sendMsgToPlayer(player, [memberListTitle, membersList]);
            break;
        }

        case "create": {
            const existingChannelName = ChatChannelManager.getPlayerChannel(player.id);

            if (existingChannelName) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You are already in a chat channel (§7${existingChannelName}§f). Leave the current channel before creating a new one.`);
            } else {
                const channelName = subCommandArgs[0];
                const password = subCommandArgs[1]; // Optional password argument

                const createResult = ChatChannelManager.createChatChannel(channelName, password, player.id);
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Chat channel '§7${channelName}§f' ${createResult ? "created." : "already exists."}`);
            }
            break;
        }

        case "delete": {
            const channelNameToDelete = subCommandArgs[0];
            const passwordToDelete = subCommandArgs[1]; // Optional password argument

            const deleteResult = ChatChannelManager.deleteChatChannel(channelNameToDelete, passwordToDelete);

            if (deleteResult === "wrong_password") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Wrong password for chat channel '§7${channelNameToDelete}§f'.`);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Chat channel '§7${channelNameToDelete}§f' ${deleteResult ? "deleted." : "not found."}`);
            }
            break;
        }

        case "invite": {
            const channelNameToInvite = subCommandArgs[0];
            const playerToInvite = subCommandArgs[1];

            if (!playerToInvite) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Usage: ${prefix}channel invite <channelName> <playerName>`);
                return;
            }

            const joinedPlayer = (world as WorldExtended).getPlayerByName(playerToInvite);

            if (playerToInvite) {
                const inviteResult = ChatChannelManager.inviteToChatChannel(playerToInvite, channelNameToInvite);
                if (inviteResult) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invited §7${playerToInvite}§f to join chat channel '§7${channelNameToInvite}§f'.`);
                    const joinedPlayerName = joinedPlayer ? joinedPlayer.name : "Unknown Player";

                    const joinMessage = `§f§4[§6Paradox§4]§f §6${joinedPlayerName}§f joined the chat channel.`;
                    const channel = ChatChannelManager.getChatChannelByName(channelNameToInvite);

                    channel.members.forEach((memberId) => {
                        const member = (world as WorldExtended).getPlayerById(memberId);
                        if (member && member !== joinedPlayer) {
                            sendMsgToPlayer(member, joinMessage);
                        }
                    });

                    sendMsgToPlayer(joinedPlayer, `§f§4[§6Paradox§4]§f §7${player.name}§f invited you to channel '§7${channelNameToInvite}§f'.`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${playerToInvite}§f is already in a chat channel.`);
                }
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Player '§7${playerToInvite}§f' not found.`);
            }
            break;
        }

        case "join": {
            const channelNameToJoin = subCommandArgs[0];
            const passwordToJoin = subCommandArgs[1]; // Optional password argument

            const newChannel = ChatChannelManager.switchChatChannel(player.id, channelNameToJoin, passwordToJoin);

            if (newChannel === "wrong_password") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Wrong password for chat channel '§7${channelNameToJoin}§f'.`);
            } else if (newChannel === "already_in_channel") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたは既にチャットチャンネルに入っています。まず現在のチャンネルから退出してください。`);
            } else if (newChannel !== false) {
                const joinedPlayer = (world as WorldExtended).getPlayerById(player.id);
                const joinedPlayerName = joinedPlayer ? joinedPlayer.name : "Unknown Player";

                const joinMessage = `§f§4[§6Paradox§4]§f §6${joinedPlayerName}§f joined the chat channel.`;
                const channel = ChatChannelManager.getChatChannelByName(channelNameToJoin);

                channel.members.forEach((memberId) => {
                    const member = (world as WorldExtended).getPlayerById(memberId);
                    if (member && member !== joinedPlayer) {
                        sendMsgToPlayer(member, joinMessage);
                    }
                });

                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You joined chat channel '§7${channelNameToJoin}§f'.`);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fチャットチャンネルに参加できません。`);
            }
            break;
        }

        case "handover": {
            const channelNameToHandOver = subCommandArgs[0];
            const newOwnerName = subCommandArgs[1];

            const handOverResult = ChatChannelManager.handOverChannelOwnership(channelNameToHandOver, player, newOwnerName);

            if (handOverResult === "not_owner") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You are not the owner of chat channel '§7${channelNameToHandOver}§f'.`);
            } else if (handOverResult === "target_not_found") {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Player '§7${newOwnerName}§f' not found.`);
            } else if (handOverResult) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Ownership of chat channel '§7${channelNameToHandOver}§f' transferred to '§7${newOwnerName}§f'.`);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fチャットの所有権を移転できない。`);
            }
            break;
        }

        case "leave": {
            const channelNameToLeave = ChatChannelManager.getPlayerChannel(player.id);

            if (!channelNameToLeave) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはどのチャットチャンネルにも入っていません。`);
                return;
            }

            const channelToLeave = ChatChannelManager.getChatChannelByName(channelNameToLeave);
            const isOwner = channelToLeave.owner === player.id;

            // チャンネルからプレーヤーを外す
            channelToLeave.members.delete(player.id);
            ChatChannelManager.clearPlayerFromChannelMap(player.id);

            // チャンネルに残っているすべてのメンバーに、プレーヤーが退席したことを知らせる。
            const leavingPlayer = (world as WorldExtended).getPlayerById(player.id);
            const leavingPlayerName = leavingPlayer ? leavingPlayer.name : "Unknown Player";
            const leaveMessage = `§f§4[§6Paradox§4]§f §6${leavingPlayerName}§f left the chat channel.`;

            channelToLeave.members.forEach((memberId) => {
                const member = (world as WorldExtended).getPlayerById(memberId);
                if (member) {
                    sendMsgToPlayer(member, leaveMessage);
                }
            });

            if (isOwner) {
                // 退団する選手がオーナーである場合、所有権を他の会員に譲渡する。
                const newOwnerId = Array.from(channelToLeave.members)[0]; // Get the first member as new owner

                if (newOwnerId) {
                    ChatChannelManager.handOverChannelOwnership(channelNameToLeave, (world as WorldExtended).getPlayerById(player.id), (world as WorldExtended).getPlayerById(newOwnerId).name);
                    const newOwnerObject = (world as WorldExtended).getPlayerById(newOwnerId);
                    sendMsgToPlayer(newOwnerObject, `§f§4[§6Paradox§4]§f Ownership of chat channel '§7${channelNameToLeave}§f' transferred to '§7${newOwnerObject.name}§f'.`);
                } else {
                    // 他にメンバーがいない場合、チャンネルを削除する。
                    ChatChannelManager.deleteChatChannel(channelNameToLeave, channelToLeave.password);
                }
            }

            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Left the chat channel '§7${channelNameToLeave}§f'.`);
            break;
        }

        default:
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Unknown chat channel command. Use '§7${prefix}channel help§f' for command help.`);
            break;
    }
}

// playerLeaveイベントを処理するコールバック関数を定義する。
function onPlayerLeave(event: PlayerLeaveAfterEvent) {
    const playerId = event.playerId;
    const channelName = ChatChannelManager.getPlayerChannel(playerId);

    if (!channelName) {
        return; // Player wasn't in any channel
    }

    const channel = ChatChannelManager.getChatChannelByName(channelName);

    if (channel.owner === playerId) {
        // 退団する選手がオーナーである場合、所有権を他の会員に譲渡する。
        const newOwnerId = Array.from(channel.members).find((memberId) => memberId !== playerId);

        if (newOwnerId) {
            ChatChannelManager.handOverChannelOwnership(channelName, (world as WorldExtended).getPlayerById(playerId), newOwnerId);
            const newOwnerObject = (world as WorldExtended).getPlayerById(newOwnerId);
            sendMsgToPlayer(newOwnerObject, `§f§4[§6Paradox§4]§f Ownership of chat channel '§7${channelName}§f' transferred to '§7${newOwnerObject.name}§f'.`);
        } else {
            // 他にメンバーがいない場合、チャンネルを削除する。
            ChatChannelManager.deleteChatChannel(channelName, channel.password);
            return;
        }
    }

    // チャンネルからプレーヤーを外す
    channel.members.delete(playerId);
    ChatChannelManager.clearPlayerFromChannelMap(playerId);

    // チャンネルに残っているすべてのメンバーに、プレーヤーが退席したことを知らせる。
    const leavingPlayer = (world as WorldExtended).getPlayerById(playerId);
    const leavingPlayerName = leavingPlayer ? leavingPlayer.name : "Unknown Player";

    const leaveMessage = `§f§4[§6Paradox§4]§f §6${leavingPlayerName}§f left the chat channel.`;
    channel.members.forEach((memberId) => {
        const member = (world as WorldExtended).getPlayerById(memberId);
        if (member) {
            sendMsgToPlayer(member, leaveMessage);
        }
    });
}

const onChannelLeave = () => {
    // コールバック関数をplayerLeaveイベントにサブスクライブする。
    world.afterEvents.playerLeave.subscribe(onPlayerLeave);
};

export { onChannelLeave };
