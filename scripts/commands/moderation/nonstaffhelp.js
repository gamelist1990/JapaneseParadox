import { getPrefix, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
/**
 * @name nonstaffhelp
 * @param {ChatSendAfterEvent} message - Message object
 */
export function nonstaffhelp(message) {
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
            config.customcommands.ui ? `§6${prefix}ui§r - GUIを開けます` : `§6${prefix}ui§rでメニューを開けます！§r.`,
            config.customcommands.map ? `§6${prefix}map§r - で今いるバイオームがわかります` : `§6${prefix}map§rで今いるバイオームが分かります！§r.`,
            `§6${prefix}ch cr <名前> [パスワード]§f - ${config.customcommands.channel ? `新しいチャットチャンネルを作成する` : textDisabled}`,
            `§6${prefix}ch de <名前> [パスワード]§f - ${config.customcommands.channel ? `既存のチャットチャンネルを削除する！` : textDisabled}`,
            `§6${prefix}ch join <名前> [パスワード]§f - ${config.customcommands.channel ? `既存のチャットチャンネルに参加する！` : textDisabled}`,
            `§6${prefix}ch in <名前> <プレイヤー>§f - ${config.customcommands.channel ? `プレイヤーをチャットチャンネルに招待する！` : textDisabled}`,
            `§6${prefix}ch ha <名前> <プレイヤー>§f - ${config.customcommands.channel ? `チャットチャンネルの所有権を譲渡する！` : textDisabled}`,
            `§6${prefix}ch le§f - ${config.customcommands.channel ? `現在のチャットチャンネルから退出する！` : textDisabled}`,
            `§6${prefix}ch me§f - ${config.customcommands.channel ? `現在のチャットチャンネルのメンバーを一覧表示します！` : textDisabled}`,

        ]);
    }
}
