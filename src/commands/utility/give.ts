import { ChatSendAfterEvent, Player, world, ItemStack } from "@minecraft/server";
import { MinecraftItemTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer, toPascalCase } from "../../util.js";

function giveHelp(player: Player, prefix: string) {
    let commandStatus: string;
    if (!config.customcommands.fullreport) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: give`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: give [optional]`,
        `§4[§6Optional§4]§f: username item amount data, help`,
        `§4[§6Description§4]§f: Gives player items.`,
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
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/give.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者権限がないと実行できません！！`);
    }

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.give) {
        return giveHelp(player, prefix);
    }

    // Are there arguements
    if (!args.length) {
        return giveHelp(player, prefix);
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
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }

    /**
     * Verify if the parameters are valid to prevent errors
     * args[0] = username
     * args[1] = item
     * args[2] = amount
     * args[3] = data (optional)
     */
    let confirmItem = false;
    const itemStringConvert = toPascalCase(args[1]);
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
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${member.name} に ${args[1]} x${args[2]}を与えました`);
        } else {
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f スタック数が上限を超えています！ ${maxStack} が最大です.`);
        }
    } else {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f このアイテムは見つかりませんでした！もう一度お試しください`);
    }
}
