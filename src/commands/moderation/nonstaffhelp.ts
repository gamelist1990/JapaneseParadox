import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

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
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId === undefined) {
        const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
        return sendMsgToPlayer(player, [
            `§l§6[§4コマンドリスト！！§6]§r`,
            configuration.customcommands.report ? `§6${prefix}report <名前> <荒らし>§r - 荒らしがいた場合これで報告できます.` : `§6${prefix}report <username>§r - Command §4無効§r.`,
            configuration.customcommands.sethome ? `§6${prefix}tps <家の名前>§r - 自分の家の座標を保存します.` : `§6${prefix}sethome <name>§r - Command §4無効§r.`,
            configuration.customcommands.gohome ? `§6${prefix}tpg <家の名前>§r - sethomeで設定した家にTPできます.` : `§6${prefix}gohome <name>§r - Command §4無効§r.`,
            configuration.customcommands.listhome ? `§6${prefix}tpl §r - 自分の作った拠点リストを見れます.` : `§6${prefix}listhome§r - Command §4無効§r.`,
            configuration.customcommands.delhome ? `§6${prefix}tpd <家の名前>§r - 家の名前を入れた拠点の座標が削除されます.` : `§6${prefix}delhome <name>§r - Command §4無効§r.`,
            configuration.customcommands.tpr ? `§6${prefix}tp <相手の名前>§r - 他のプレイヤーにTP申請を送れます相手が承諾するとtpされます.` : `§6${prefix}tpr <name>§r - Command §4無効§r.`,
            configuration.customcommands.paradoxiu ? `§6${prefix}ui§r - GUIを開けます` : `§6${prefix}ui§rでメニューを開けます！§r.`,
            configuration.customcommands.biome ? `§6${prefix}map§r - で今いるバイオームがわかります` : `§6${prefix}map§rで今いるバイオームが分かります！§r.`,
        ]);
    }
}
