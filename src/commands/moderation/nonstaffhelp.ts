import { getPrefix, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { ChatSendAfterEvent, Vector3 } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

/**
 * @name nonstaffhelp
 * @param {ChatSendAfterEvent} message - Message object
 */
export function nonstaffhelp(message: ChatSendAfterEvent) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/nonstaffhelp.js:7)");
    }

    const player = message.sender;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId === undefined) {
        return sendMsgToPlayer(player, [
            `§l§6[§4コマンドリスト！！§6]§r`,
            config.customcommands.report ? `§6${prefix}report <名前> <荒らし>§r - 荒らしがいた場合これで報告できます.` : `§6${prefix}report <username>§r - Command §4DISABLED§r.`,
            config.customcommands.sethome ? `§6${prefix}tps <家の名前>§r - 自分の家の座標を保存します.` : `§6${prefix}sethome <name>§r - Command §4DISABLED§r.`,
            config.customcommands.gohome ? `§6${prefix}tpg <家の名前>§r - sethomeで設定した家にTPできます.` : `§6${prefix}gohome <name>§r - Command §4DISABLED§r.`,
            config.customcommands.listhome ? `§6${prefix}tpl §r - 自分の作った拠点リストを見れます.` : `§6${prefix}listhome§r - Command §4DISABLED§r.`,
            config.customcommands.delhome ? `§6${prefix}tpd <家の名前>§r - 家の名前を入れた拠点の座標が削除されます.` : `§6${prefix}delhome <name>§r - Command §4DISABLED§r.`,
            config.customcommands.tpr ? `§6${prefix}tp <相手の名前>§r - 他のプレイヤーにTP申請を送れます相手が承諾するとtpされます.` : `§6${prefix}tpr <name>§r - Command §4DISABLED§r.`,
            config.customcommands.paradoxiu ? `§6${prefix}ui§r - GUIを開けます` : `§6${prefix}ui§rでメニューを開けます！§r.`,
            config.customcommands.biome ? `§6${prefix}map§r - で今いるバイオームがわかります` : `§6${prefix}map§rで今いるバイオームが分かります！§r.`,
            config.customcommands.channel ? `§6${prefix}ch cr §rで新しいチャットチャンネルを作成する` : `§6${prefix}channel create <channel> [password?]§f - Command §4DISABLED§f.`,
            config.customcommands.channel ? `§6${prefix}ch de §r<名前> [パスワード]§f .` : `§6${prefix}channel delete <channel> [password?]§f - Command §4DISABLED§f.`,
            config.customcommands.channel ? `§6${prefix}ch join §r<名前> [パスワード]§f .` : `§6${prefix}channel join <channel> [password?]§f - Command §4DISABLED§f.`,
            config.customcommands.channel ? `§6${prefix}ch in §r<名前> <プレイヤー>§f -` : `§6${prefix}channel invite <channel> <player>§f - Command §4DISABLED§f.`,
            config.customcommands.channel ? `§6${prefix}ch ha §r<名前> <プレイヤー>§f .` : `§6${prefix}channel invite <channel> <player>§f - Command §4DISABLED§f.`,
            config.customcommands.channel ? `§6${prefix}ch le§f -§rで現在のチャンネルから抜けます ` : `§6${prefix}channel invite <channel> <player>§f - Command §4DISABLED§f.`,
            config.customcommands.channel ? `§6${prefix}ch me§f -§rで現在入っているチャンネルを表示！ .` : `§6${prefix}channel leave§f - Command §4DISABLED§f.`,
        ]);
    }
}
