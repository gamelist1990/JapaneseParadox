import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { paradoxui } from "../../gui/paradoxui.js";
import { ShowRules } from "../../gui/showrules/showrules.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
function paradoxuiHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.paradoxiu) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: paradoxui`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: paradoxui [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Shows GUI for main menu.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}paradoxui`,
        `        §4- §6Open the Paradox main menu GUI§f`,
        `    ${prefix}paradoxui help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name paradoxUI
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function paradoxUI(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/paradoxui.js:36)");
    }
    const player = message.sender;
    const showrulesBoolean = dynamicPropertyRegistry.get("showrules_b");
    //check to see if the player has the rules tag incase they have been able to call the UI command before the
    // rules have been displayed.
    if (player.hasTag("ShowRulesOnJoin") && showrulesBoolean === true) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fルールに同意してから開いて下さい`);
        return ShowRules();
    }
    // Check for custom prefix
    const prefix = getPrefix(player);
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.paradoxiu) {
        return paradoxuiHelp(player, prefix);
    }
    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f チャット欄を閉じるとメニューが開きます`);
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f がメニューを開きました`);
    paradoxui(player);
}
