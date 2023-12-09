import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function delhomeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: delhome`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: delhome [オプション］`,
        `§4[§6オプション§4]§f: 名前、ヘルプ`,
        `§4[§6説明§4]§f：指定された保存されたホームの場所を削除する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}delhome cave`,
        `        §4- §6保存されている "cave "という名前のホームロケーションを削除する§f`,
        `    ${prefix}delhome help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name delhome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function delhome(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/delhome.js:26)");
    }

    const player = message.sender;

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // キャッシュ
    const length = args.length;

    // 反論はあるか
    if (!length) {
        return delhomeHelp(player, prefix, configuration.customcommands.delhome);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.delhome) {
        return delhomeHelp(player, prefix, configuration.customcommands.delhome);
    }

    // スペースを許可しない
    if (length > 1) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前にスペースを入れないでください！`);
    }

    // 安全のために座標をハッシュ化する
    const salt = world.getDynamicProperty("crypt");

    // この保存されたホームロケーションを検索して削除する
    let verify = false;
    let encryptedString: string = "";
    const tags = player.getTags();
    const tagsLength = tags.length;
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            encryptedString = tags[i];
            // それを検証するためにデコードする
            tags[i] = (world as WorldExtended).decryptString(tags[i], salt as string);
        }
        if (tags[i].startsWith(args[0].toString() + " X", 13)) {
            verify = true;
            player.removeTag(encryptedString);
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f '§7${args[0]}§f'というホームを正常に削除しました！`);
            break;
        }
    }
    if (verify === true) {
        return;
    } else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f '§7${args[0]}§f'というホームは存在しません！`);
    }
}
