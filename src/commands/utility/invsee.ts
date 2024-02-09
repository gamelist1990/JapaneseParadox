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
        `\n§o§4[§6コマンド§4]§f: invsee`,
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: invsee [optional]`,
        `§4[§6Optional§4]§f: username, help`,
        `§4[§6説明§4]§f: Shows the entire inventory of the specified player.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}invsee ${player.name}`,
        `        §4- §6Show the inventory of ${player.name}§f`,
        `    ${prefix}invsee help`,
        `        §4- §6Show command help§f`,
    ]);
}

// found the inventory viewing scipt in the bedrock addons discord, unsure of the original owner (not my code)
/**
 * @name invsee
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function invsee(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? ./commands/utility/invsee.js:30)");
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

    // Are there arguements
    if (!args.length) {
        return invseeHelp(player, prefix, configuration.customcommands.invsee);
    }

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.invsee) {
        return invseeHelp(player, prefix, configuration.customcommands.invsee);
    }

    // try to find the player requested
    let member: Player;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f そのプレーヤーが見つかりませんでした!
`
        );
    }

    const inv = member.getComponent("inventory") as EntityInventoryComponent;
    const container = inv.container;

    sendMsgToPlayer(player, [
        ` `,
        `§f§4[§6Paradox§4]§f ${member.name}'s inventory:`,
        ...Array.from(Array(container.size), (_a, i) => {
            let enchantmentInfo = "";
            const item = container.getItem(i);
            if (item) {
                const enchantmentComponent = item.getComponent("enchantments") as ItemEnchantsComponent;
                if (enchantmentComponent) {
                    const enchantmentList = enchantmentComponent ? Array.from(enchantmentComponent.enchantments) : [];

                    if (enchantmentList.length > 0) {
                        const enchantmentNames = enchantmentList.map((enchantment) => `        §6- §4[§f${enchantment.type.id}§4]§f §6Level: §4${enchantment.level}`);
                        enchantmentInfo = `\n    §4[§6Enchantments§4]§6:\n${enchantmentNames.join("\n")}`;
                    }
                    if (enchantmentInfo) {
                        enchantmentInfo = enchantmentInfo + "\n";
                    }
                }
            }

            return ` §o§6|§f §fSlot ${i}§f §6=>§f ${item ? `§4[§f${item.typeId.replace("minecraft:", "")}§4]§f §6Amount: §4x${item.amount}` : "§7(empty)"}${enchantmentInfo}`;
        }),
        ` `,
    ]);
}
