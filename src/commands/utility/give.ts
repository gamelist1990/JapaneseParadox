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
        `\n§o§4[§6コマンド§4]§f: give`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: give [optional]`,
        `§4[§6Optional§4]§f: username item amount data, help`,
        `§4[§6説明§4]§f: Gives player items.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}give ${player.name} diamond 64`,
        `        §4- §6Give ${player.name} 64 diamonds§f`,
        `    ${prefix}give ${player.name} iron_ore 64`,
        `        §4- §6Give ${player.name} 64 iron ore§f`,
        `    ${prefix}give ${player.name} tropical_fish 64`,
        `        §4- §6Give ${player.name} 64 tropical fish§f`,
        `    ${prefix}give ${player.name} log2 64 1`,
        `        §4- §6Give ${player.name} 64 spruce logs§f`,
        `    ${prefix}give help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name give
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function give(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? (./commands/utility/give.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f このコマンドを使用するには、管理者にしか使えません
`
        );
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.give) {
        return giveHelp(player, prefix, configuration.customcommands.give);
    }

    // Are there arguements
    if (!args.length) {
        return giveHelp(player, prefix, configuration.customcommands.give);
    }

    // Try to find the player requested
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

    // Are they online?
    if (!member) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f そのプレーヤーが見つかりませんでした!
`
        );
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

        // Make a new ItemStack so we can validate the max allowed amount for that item
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f This item could not be found! Try again.`);
    }
}
