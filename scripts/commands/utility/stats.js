import { ItemStack, world } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer, getGamemode, allscores, getScore } from "../../util.js";
function statsHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.stats) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: stats`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: stats [optional]`,
        `§4[§6Optional§4]§f: username, help`,
        `§4[§6Description§4]§f: Shows logs from the specified user.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}stats ${player.name}`,
        `        §4- §6Show logs for the specified user§f`,
        `    ${prefix}stats help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name stats
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function stats(message, args) {
    handleStats(message, args).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}
async function handleStats(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/stats.js:29)");
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
    // Are there arguements
    if (!args.length) {
        return statsHelp(player, prefix);
    }
    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.stats) {
        return statsHelp(player, prefix);
    }
    if (!player.hasTag("notify")) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f チート通知を有効にしてください`);
    }
    // try to find the player requested
    let member;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f プレイヤーが存在しない又はオフラインです`);
    }
    const reportBody = [
        `\n§r§4[§6Paradox§4]§r §6${member.name}のユーザーログを取得しました§r`,
        `§r§4[§6Paradox§4]§r §6${member.name}§rは${getGamemode(member)}です`,
        `§r§4[§6Paradox§4]§r §6${member.name}§rは現在 X= ${member.location.x.toFixed(0)} Y= ${member.location.y.toFixed(0)} Z= ${member.location.z.toFixed(0)}にいます`,
    ];
    switch (true) {
        case member.hasTag("freeze"):
            reportBody.push(`§r§4[§6Paradox§4]§r §6${member.name}§r盲目が有効です`);
            break;
        case member.hasTag("flying"):
            reportBody.push(`§r§4[§6Paradox§4]§r §6${member.name}§r飛行モードが有効です`);
            break;
        case member.hasTag("vanish"):
            reportBody.push(`§r§4[§6Paradox§4]§r §6${member.name}§r透明化が有効です`);
            break;
    }
    let violationsFound = 0;
    let vlCount = 0;
    let divider = false;
    allscores.forEach((objective) => {
        vlCount++;
        const score = getScore(objective, member);
        if (score > 0) {
            violationsFound++;
            if (violationsFound === 1) {
                divider = true;
                reportBody.push(`§r§4[§6Paradox§4]§4 ----------------------------------§r`);
            }
            reportBody.push(`§r§4[§6Paradox§4]§r §r§4[§6${objective.replace("vl", "").toUpperCase()}§4]§r ${score}回検知されています`);
        }
        if (vlCount === allscores.length && divider === true) {
            reportBody.push(`§r§4[§6Paradox§4]§4 ----------------------------------§r`);
        }
    });
    const equipment = member.getComponent("equipment_inventory");
    const helmet = equipment.getEquipment("head");
    const chest = equipment.getEquipment("chest");
    const legs = equipment.getEquipment("legs");
    const feet = equipment.getEquipment("feet");
    const mainhand = equipment.getEquipment("mainhand");
    const offhand = equipment.getEquipment("offhand");
    const materialColors = {
        golden: "§6",
        iron: "§7",
        diamond: "§b",
        leather: "§e",
        chainmail: "§8",
        turtle: "§a",
        netherite: "§4",
        elytra: "§5",
        none: "§f", // white
    };
    for (const [verification, armorType] of [
        [helmet, "帽子"],
        [chest, "服"],
        [legs, "ズボン"],
        [feet, "靴"],
        [mainhand, "メインハンド"],
        [offhand, "オフハンド"],
    ]) {
        if (!(verification instanceof ItemStack)) {
            continue;
        }
        const enchantedEquipment = verification.getComponent("enchantments");
        const enchantList = enchantedEquipment.enchantments;
        if (!enchantList) {
            continue;
        }
        let isEnchanted = false;
        for (const enchant in MinecraftEnchantmentTypes) {
            const enchantNumber = enchantList.hasEnchantment(MinecraftEnchantmentTypes[enchant]);
            if (enchantNumber > 0) {
                isEnchanted = true;
            }
        }
        let materialType = verification.typeId.split(":")[1].replace(/_\w+/, "");
        if (armorType === "Mainhand" || armorType === "Offhand") {
            materialType = verification.typeId.split(":")[1];
        }
        const materialColor = materialColors[materialType] || materialColors["none"];
        reportBody.push(`§r§4[§6Paradox§4]§r ${armorType}: ${isEnchanted ? "§aエンチャ有§r" : "§4エンチャ無§r"} || ${materialColor}${materialType}`);
    }
    sendMsgToPlayer(player, reportBody);
}
