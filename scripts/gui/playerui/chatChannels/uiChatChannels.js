import { MessageFormData,  } from "@minecraft/server-ui";
import { chatChannels, createChatChannel, getPlayerById, getPlayerChannel, sendMsgToPlayer, switchChatChannel } from "../../../util";

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
            msgUI.title("§4チャンネルを生成できませんでした§4");
            msgUI.body("§f あなたは既にチャットに入っています §6(${existingChannelName}). §f今入っているチャットを抜けてから新しく作ってください");
            msgUI.button1("了解！");
            msgUI.show(player);
        } else {
            const channelName = txtChannelName;
            const password = txtChannelPassword; // Optional password argument

            const createResult = createChatChannel(channelName.toString(), password.toString(), player.id);
            const msgUI = new MessageFormData();
            msgUI.title("§4チャットチャンネル！§4");
            msgUI.body(`§f§4[§6Paradox§4]§f チャットチャンネル！ '${channelName}' ${createResult ? "§2作る！" : "§6同じ名前が存在します"}`);
            msgUI.button1("はい");
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
            msgUI.title("§4チャンネルに入れませんでした§4");
            msgUI.body("§f あなたは既にチャンネルに参加しています §6(${existingChannelName}). §f今参加しているチャンネルから抜けてから新しく入って下さい");
            msgUI.button1("はい");
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
                uiMessage = `§6 チャンネルのパスワードが違います！参加しようとしたチャンネル＝＞ §f'${selectedChannelName}'.`;
            } else if (newChannel === "already_in_channel") {
                uiMessage = `§6 あなたは既にチャンネルに入っています！抜けてから入ってください`;
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
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f チャンネルに参加できません.`);
            }

            const msgUI = new MessageFormData();
            msgUI.title("§4チャンネルを作成§4");
            msgUI.body(uiMessage);
            msgUI.button1("はい");
            msgUI.show(player);
        }
    }
}