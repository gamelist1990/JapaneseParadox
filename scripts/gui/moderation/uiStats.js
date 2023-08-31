import { ItemStack, world } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { ActionFormData } from "@minecraft/server-ui";
import { allscores, getGamemode, getScore } from "../../util";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
export function uiSTATS(statsResult, onlineList, player) {
    if (!statsResult || statsResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value] = statsResult.formValues;
    let member = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    if (!member) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ユーザーがオフライン又は存在しません`);
        return;
    }
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    if (uniqueId !== player.name) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
        return;
    }
    const allObjectives = allscores;
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
