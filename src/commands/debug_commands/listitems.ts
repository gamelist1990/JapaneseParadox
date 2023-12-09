import { ChatSendAfterEvent, ItemStack, Player, world } from "@minecraft/server";
import { MinecraftItemTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import ConfigInterface from "../../interfaces/Config";

function listItems(player: Player, prefix: string, debug: boolean) {
    let commandStatus: string;
    if (!debug) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n項目リスト§4[§6 コマンド§4]§f: listitems`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: listitems [オプション].`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6説明§4]§f：ゲーム内のすべてのアイテムとその最大スタックを表示する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}listitems`,
        `    ${prefix}listitems help`,
    ]);
}

/**
 * @name listitems
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function listitems(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/debug_commands/listitems.js:30)");
    }

    const player = message.sender;

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // ハッシュ/ソルトのチェックとパスワードの検証
    const hash = player.getDynamicProperty("hash");
    const salt = player.getDynamicProperty("salt");

    // オペレーターのIDまたは暗号化パスワードのいずれかをキーとして使用する。
    const key = configuration.encryption.password ? configuration.encryption.password : player.id;

    // ハッシュを生成する
    const encode = (world as WorldExtended).hashWithSalt(salt as string, key);
    // ユーザーにコマンドを実行する権限があることを確認する。
    if (!encode || hash === undefined || encode !== hash) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.debug) {
        return listItems(player, prefix, configuration.debug);
    }

    for (const item in MinecraftItemTypes) {
        const itemInfo = new ItemStack(MinecraftItemTypes[item as keyof typeof MinecraftItemTypes]);
        console.log("'" + itemInfo.typeId + "': " + itemInfo.maxAmount + ",");
    }
    sendMsgToPlayer(player, "§f§4[§6Paradox§4]§f List completed. Check console logs.");
}
