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
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f The player is not online.`);
        return;
    }
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    if (uniqueId !== player.name) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 管理者しか実行できません.`);
        return;
    }
    const allObjectives = allscores;
    const reportBody = [
        `§6ログ ${member.name}§f\n\n`,
        `§fゲームモード:§6 ${getGamemode(member)}\n`,
        `§f座標: §4X= ${member.location.x.toFixed(0)} §2Y= ${member.location.y.toFixed(0)} §3Z= ${member.location.z.toFixed(0)}\n`,
        `§f§4--------------------------------§f\n`,
        `§6${member.name}'の検知回数 §f\n`,
    ];
    switch (true) {
        case member.hasTag("paradoxFreeze"):
            reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§f フリーズ　検知内容＝＞ ${member.hasTag("freezeAura") ? "AntiKillAura" : member.hasTag("freezeNukerA") ? "AntiNukerA" : member.hasTag("freezeScaffoldA") ? "AntiScaffoldA" : "Staff"}`);
            break;
        case member.hasTag("flying"):
            reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§f 飛行有効`);
            break;
        case member.hasTag("vanish"):
            reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§f 透明化有効`);
            break;
    }
    allObjectives.forEach((objective) => {
        const score = getScore(objective, member);
        if (score > 0) {
            reportBody.push(`§f§4[§6${objective.replace("vl", "").toUpperCase()}§4]§f number of Violations: ${score}\n`);
        }
    });
    reportBody.push(`§f§4--------------------------------§f\n`);
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
        reportBody.push(`§f${armorType}: ${isEnchanted ? "§aEnchanted§f" : "§4Unenchanted§f"} || ${materialColor}${materialType}\n`);
    }
    const ResultsUI = new ActionFormData();
    ResultsUI.title("§4Paradox - Report for §4" + member.name);
    const tempstring = reportBody.toString().replaceAll(",", "");
    ResultsUI.body(tempstring);
    ResultsUI.button("Close");
    ResultsUI.show(player)
        .then(() => {
        //Simply re show the main UI
        paradoxui(player);
        return;
    })
        .catch((error) => {
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
    //return player;
}
