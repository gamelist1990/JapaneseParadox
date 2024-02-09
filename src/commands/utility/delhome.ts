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
        `§4[§6ステータス§4]§f: ${commandStatus}`,
        `§4[§6使用法§4]§f: delhome [optional]`,
        `§4[§6Optional§4]§f: name, help`,
        `§4[§6説明§4]§f: Will delete specified saved home location.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}delhome cave`,
        `        §4- §6Delete the saved home location named "cave"§f`,
        `    ${prefix}delhome help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name delhome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function delhome(message: ChatSendAfterEvent, args: string[]) {
    // Validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "エラー: ${message} が定義されていません。渡すのを忘れましたか? ./commands/utility/delhome.js:26)");
    }

    const player = message.sender;

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Cache
    const length = args.length;

    // Are there arguements
    if (!length) {
        return delhomeHelp(player, prefix, configuration.customcommands.delhome);
    }

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.delhome) {
        return delhomeHelp(player, prefix, configuration.customcommands.delhome);
    }

    // Don't allow spaces
    if (length > 1) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f No spaces in names please!`);
    }

    // Hash the coordinates for security
    const salt = world.getDynamicProperty("crypt");

    // Find and delete this saved home location
    let verify = false;
    let encryptedString: string = "";
    const tags = player.getTags();
    const tagsLength = tags.length;
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            encryptedString = tags[i];
            // Decode it so we can verify it
            tags[i] = (world as WorldExtended).decryptString(tags[i], salt as string);
        }
        if (tags[i].startsWith(args[0].toString() + " X", 13)) {
            verify = true;
            player.removeTag(encryptedString);
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Successfully deleted home '§7${args[0]}§f'!`);
            break;
        }
    }
    if (verify === true) {
        return;
    } else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Home '§7${args[0]}§f' does not exist!`);
    }
}
