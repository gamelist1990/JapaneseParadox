import { ChatSendAfterEvent, EntityInventoryComponent, ItemEnchantsComponent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

function invseeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f: invsee`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: invsee [オプション].`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6解説§4]§f：指定したプレイヤーのインベントリ全体を表示する。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}invsee ${player.name}`,
        `        §4- §6Show the inventory of ${player.name}§f`,
        `    ${prefix}invsee help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

// Bedrock addonsのdiscordでインベントリ閲覧のsciptを見つけた。
/**
 * @name invsee
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function invsee(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/invsee.js:30)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 反論はあるか
    if (!args.length) {
        return invseeHelp(player, prefix, configuration.customcommands.invsee);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.invsee) {
        return invseeHelp(player, prefix, configuration.customcommands.invsee);
    }

    // リクエストされた選手を探す
    let member: Player;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    const inv = member.getComponent("inventory") as EntityInventoryComponent;
    const container = inv.container;

    sendMsgToPlayer(player, [
        ` `,
        `§f§4[§6Paradox§4]§f ${member.name}'の持ち物:`,
        ...Array.from(Array(container.size), (_a, i) => {
            let enchantmentInfo = "";
            const item = container.getItem(i);
            if (item) {
                const enchantmentComponent = item.getComponent("enchantments") as ItemEnchantsComponent;
                if (enchantmentComponent) {
                    const enchantmentList = enchantmentComponent ? Array.from(enchantmentComponent.enchantments) : [];

                    if (enchantmentList.length > 0) {
                        const enchantmentNames = enchantmentList.map((enchantment) => `        §6- §4[§f${enchantment.type.id}§4]§f §6レベル: §4${enchantment.level}`);
                        enchantmentInfo = `\n    §4[§6エンチャ§4]§6:\n${enchantmentNames.join("\n")}`;
                    }
                    if (enchantmentInfo) {
                        enchantmentInfo = enchantmentInfo + "\n";
                    }
                }
            }

            return ` §o§6|§f §fSlot ${i}§f §6=>§f ${item ? `§4[§f${item.typeId.replace("minecraft:", "")}§4]§f §6数: §4x${item.amount}` : "§7(無)"}${enchantmentInfo}`;
        }),
        ` `,
    ]);
}
