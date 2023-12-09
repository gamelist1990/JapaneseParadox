import { ChatSendAfterEvent, Player, world, ItemStack } from "@minecraft/server";
import { MinecraftItemTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World";
import ConfigInterface from "../../interfaces/Config";

function giveHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: 与える`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：与える [任意］`,
        `§4[§6オプション§4]§f: ユーザー名項目量データ、ヘルプ`,
        `§4[§6解説§4]§f：プレイヤーにアイテムを与えます。`,
        `§4[§6例§4]§f：`,
        `${prefix}give ${player.name} diamond 64`,
        `    §4- §6${player.name}にダイヤモンドを64個与える§f`,
        `${prefix}give ${player.name} iron_ore 64`,
        `    §4- §6${player.name}に鉄鉱石を64個与える§f`,
        `${prefix}give ${player.name} tropical_fish 64`,
        `    §4- §6${player.name}に熱帯魚を64個与える§f`,
        `${prefix}give ${player.name} log2 64 1`,
        `    §4- §6${player.name}にスプルースの原木を64個与える§f`,
        `${prefix}give help`,
        `    §4- §6コマンドのヘルプを表示する§f`,
    ]);
}

/**
 * @name give
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function give(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/give.js:36)");
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

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.give) {
        return giveHelp(player, prefix, configuration.customcommands.give);
    }

    // 反論はあるか
    if (!args.length) {
        return giveHelp(player, prefix, configuration.customcommands.give);
    }

    // 要求された選手を見つけよう
    let member: Player;
    if (args.length) {
        const players = world.getPlayers();
        for (const pl of players) {
            if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
                break;
            }
        }
    }

    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f その選手は見つからなかった！`);
    }

    /**
     * Verify if the parameters are valid to prevent errors
     * args[0] = username
     * args[1] = item
     * args[2] = amount
     * args[3] = data (optional)
     */
    let confirmItem = false;
    const itemStringConvert = (world as WorldExtended).toPascalCase(args[1]);
    for (const itemValidate in MinecraftItemTypes) {
        if (itemStringConvert === itemValidate) {
            confirmItem = true;
            break;
        }
    }
    if (confirmItem) {
        if (isNaN(Number(args[2]))) {
            /**
             * This parameter is invalid so we will remove it and add a default value of 1.
             */
            args.splice(2, 1, "1");
        }
        if (isNaN(Number(args[3]))) {
            /**
             * This parameter is invalid
             */
            args.splice(3, 1, "0");
        }

        // 新しいItemStackを作成し、そのアイテムの最大許容額を検証できるようにする。
        const newItemStack = new ItemStack(args[1]);
        const maxStack = newItemStack.maxAmount;
        if (maxStack >= Number(args[2])) {
            player.runCommandAsync(`give ${member.name} ${args[1]} ${Number(args[2])} ${Number(args[3])}`);
            /* This is commented out because in 1.19.70 they removed the data parameter from ItemStack
            const invContainer = member.getComponent("inventory") as EntityInventoryComponent;

            const inv = invContainer.container;
            const item = new ItemStack(MinecraftItemTypes[itemStringConvert], Number(args[2]), Number(args[3]));
            inv.addItem(item);
            */
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f §7${member.name}§f was given §7${args[1]}§f x§7${args[2]}§f.`);
        } else {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f This stack is too high! §7${maxStack}§f is the max. Try again.`);
        }
    } else {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこの項目は見つかりませんでした！もう一度試してください。`);
    }
}
