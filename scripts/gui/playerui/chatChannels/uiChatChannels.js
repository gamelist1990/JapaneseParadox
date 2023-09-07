import { world } from "@minecraft/server";
import { MessageFormData, } from "@minecraft/server-ui";
import { chatChannels, createChatChannel, deleteChatChannel, getPlayerById, getPlayerChannel, handOverChannelOwnership, inviteToChatChannel, sendMsgToPlayer, switchChatChannel } from "../../../util";

export function uiChatChannelCreate(ChatChannelCreateUIResult, player) {
    handleUIChatChannelCreate(ChatChannelCreateUIResult, player).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIChatChannelCreate(ChatChannelCreateUIResult, player) {
        const [txtChannelName, txtChannelPassword] = ChatChannelCreateUIResult.formValues;
        const existingChannelName = getPlayerChannel(player.id);

        if (existingChannelName) {
            const msgUI = new MessageFormData();
            msgUI.title("§4チャンネルを作成できませんでした§4");
            msgUI.body(`§f あなたは既にチャットチャンネルに入っています！ 現チャンネル＝＞ §6(${existingChannelName}). §f今入っているチャンネルから抜けてから作りなおしてくださいね`);
            msgUI.button1("OK");
            msgUI.show(player);
        } else {
            const channelName = txtChannelName;
            const password = txtChannelPassword; // Optional password argument

            const createResult = createChatChannel(channelName.toString(), password.toString(), player.id);
            const msgUI = new MessageFormData();
            msgUI.title("§4チャンネル作成：メニュー§4");
            msgUI.body(`§f§4[§6Paradox§4]§f Chat channel '${channelName}' ${createResult ? "§2created." : "§6already exists."}`);
            msgUI.button1("OK");
        }
    }
}
export function uiChatChannelJoin(ChatChannelJoinUIResult, player, channelDropdownData) {
    handleUIChatChannelJoin(ChatChannelJoinUIResult, player, channelDropdownData).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIChatChannelJoin(ChatChannelJoinUIResult, player, channelDropdownData) {
        const [ddChannelName, txtChannelPassword] = ChatChannelJoinUIResult.formValues;
        const existingChannelName = getPlayerChannel(player.id);

        if (existingChannelName) {
            const msgUI = new MessageFormData();
            msgUI.title("§4参加できませんでした§4");
            msgUI.body("§f あなたは既にチャットチャンネルに入っています！ 現チャンネル＝＞ §6(${existingChannelName}). §f今入っているチャンネルから抜けてから作りなおしてくださいね");
            msgUI.button1("OK");
            msgUI.show(player);
        } else {
            const selectedNumber = ddChannelName; //Presented as a Number not the dropdown value the player sees
            let selectedChannelName = ""; //This will be used to store the extracted data.

            for (const item of channelDropdownData) {
                if (parseInt(item.value) === selectedNumber) {
                    const commaIndex = item.text.indexOf(","); // We need the channel name before the comma
                    if (commaIndex !== -1) {
                        selectedChannelName = item.text.substring(0, commaIndex).trim();
                    } else {
                        selectedChannelName = item.text.trim(); // if no comma is found trim the entire text.
                    }
                    break;
                }
            }
            //Join code extracted from visuals chat commands. I have added a uiMessage to store any errors or if the player is added to the channel.
            const passwordToJoin = txtChannelPassword.toString(); // Optional password argument
            const newChannel = switchChatChannel(player.id, selectedChannelName, passwordToJoin);
            let uiMessage = "";
            if (newChannel === "wrong_password") {
                uiMessage = `§6 パスワードが違います §f'${selectedChannelName}'.`;
            } else if (newChannel === "already_in_channel") {
                uiMessage = `§6 あなたは既にチャットチャンネルに入っています！ 今いるチャンネルを抜けてから入ってください`;
            } else if (newChannel !== false) {
                const joinedPlayer = getPlayerById(player.id);
                const joinedPlayerName = joinedPlayer ? joinedPlayer.name : "Unknown Player";

                const joinMessage = `§f§4[§6Paradox§4]§f §6${joinedPlayerName}§f がチャンネルに参加しました`;
                const channel = chatChannels[selectedChannelName];
                uiMessage = `§f You have been added to §2${selectedChannelName}.`;

                channel.members.forEach((memberId) => {
                    const member = getPlayerById(memberId);
                    if (member && member !== joinedPlayer) {
                        sendMsgToPlayer(member, joinMessage);
                    }
                });
            } else {
                uiMessage = `§6チャンネルに参加できませんでした §r${selectedChannelName}, もう一度試してみてください`;
            }

            const msgUI = new MessageFormData();
            msgUI.title("§4チャンネル作成：メニュー§4");
            msgUI.body(uiMessage);
            msgUI.button1("OK");
            msgUI.show(player);
        }
    }
}
export function uiChatChannelInvite(ChatChannelJoinUIResult, player, channelDropdownData, onlineList) {
    handleUIChatChannelInvite(ChatChannelJoinUIResult, player, channelDropdownData, onlineList).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIChatChannelInvite(ChatChannelInviteUIResult, player, channelDropdownData, onlineList) {
        const [ddChannelName, ddMember] = ChatChannelInviteUIResult.formValues;
        // const existingChannelName = getPlayerChannel(player.id);
        let uiMessage = "";
        const selectedNumber = ddChannelName; //Presented as a Number not the dropdown value the player sees
        let selectedChannelName = ""; //This will be used to store the extracted data.
        for (const item of channelDropdownData) {
            if (parseInt(item.value) === selectedNumber) {
                const commaIndex = item.text.indexOf(","); // We need the channel name before the comma
                if (commaIndex !== -1) {
                    selectedChannelName = item.text.substring(0, commaIndex).trim();
                } else {
                    selectedChannelName = item.text.trim(); // if no comma is found trim the entire text.
                }
                break;
            }
        }
        let member = undefined;
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(onlineList[ddMember].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
        //Invite code from visuals command chat channels
        const channelNameToInvite = selectedChannelName;
        const playerToInvite = member.name;
        if (!playerToInvite) {
            uiMessage = `§6 招待するプレイヤーを選択しましたが、何か問題が発生しました。`;
        }
        const joinedPlayer = getPlayerByName(playerToInvite);
        if (playerToInvite) {
            const inviteResult = inviteToChatChannel(playerToInvite, channelNameToInvite);
            if (inviteResult) {
                uiMessage = `§f招待 ${playerToInvite} をパーティーに招待しました '${channelNameToInvite}'.`;
                const joinedPlayerName = joinedPlayer ? joinedPlayer.name : "Unknown Player";

                const joinMessage = `§f§4[§6Paradox§4]§f §6${joinedPlayerName}§f がパーティーに参加！.`;
                const channel = chatChannels[channelNameToInvite];

                channel.members.forEach((memberId) => {
                    const member = getPlayerById(memberId);
                    if (member && member !== joinedPlayer) {
                        sendMsgToPlayer(member, joinMessage);
                    }
                });

                sendMsgToPlayer(joinedPlayer, `§f§4[§6Paradox§4]§f ${player.name}があなたに以下のチャンネルに入るよう招待を送りました '${channelNameToInvite}'.`);
            } else {
                uiMessage = `§6f ${playerToInvite} すでにチャンネルに入っています`;
            }
        } else {
            uiMessage = `§6そのプレイヤーは '${playerToInvite}' 見つかりません.`;
        }
        const msgUI = new MessageFormData();
        msgUI.title("§4招待：メニュー§4");
        msgUI.body(uiMessage);
        msgUI.button1("OK");
        msgUI.show(player);
    }
}
export function uiChatChannelLeave(ChatChannelLeaveUIResult, player, channelDropdownData) {
    handleUIChatChannelLeave(ChatChannelLeaveUIResult, player, channelDropdownData).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });

    async function handleUIChatChannelLeave(ChatChannelLeaveUIResult, player, channelDropdownData) {
        //const [ddChannelName] = ChatChannelLeaveUIResult.formValues;
        const channelNameToLeave = getPlayerChannel(player.id);

        if (!channelNameToLeave) {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f どのチャットチャンネルにも入っていません.`);
            return;
        }

        const channelToLeave = chatChannels[channelNameToLeave];
        const isOwner = channelToLeave.owner === player.id;

        // Remove the player from the channel
        channelToLeave.members.delete(player.id);
        playerChannelMap[player.id] = null;

        // Inform all remaining members in the channel that the player left
        const leavingPlayer = getPlayerById(player.id);
        const leavingPlayerName = leavingPlayer ? leavingPlayer.name : "Unknown Player";
        const leaveMessage = `§f§4[§6Paradox§4]§f §6${leavingPlayerName}§f チャットチャンネルから抜けました.`;

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
                sendMsgToPlayer(newOwnerObject, `§f§4[§6Paradox§4]§f チャットチャンネルの所有権'${channelNameToLeave}' を変更します変更先＝＞'${newOwnerObject.name}'.`);
            } else {
                // If no other members, delete the channel
                deleteChatChannel(channelNameToLeave, channelToLeave.password);
            }
        }

        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f パーティーから抜けました '${channelNameToLeave}'.`);
    }
}