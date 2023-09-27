import { EntityEquippableComponent, EquipmentSlot, ItemEnchantsComponent, ItemStack, Player, world } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { ActionFormData, ModalFormResponse } from "@minecraft/server-ui";
import { getGamemode } from "../../util";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { ScoreManager } from "../../classes/ScoreManager";

export function uiSTATS(statsResult: ModalFormResponse, onlineList: string[], player: Player) {
    if (!statsResult || statsResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [value] = statsResult.formValues;

    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }

    if (!member) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f オンラインではないです`);
        return;
    }

    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    if (uniqueId !== player.name) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped.`);
        return;
    }

    const allObjectives = ScoreManager.allscores;

    const reportBody = [
        `§6ステータス ${member.name}§f\n\n`,
        `§fゲームモード:§6 ${getGamemode(member)}\n`,
        `§f座標: §4X= ${member.location.x.toFixed(0)} §2Y= ${member.location.y.toFixed(0)} §3Z= ${member.location.z.toFixed(0)}\n`,
        `§f§4--------------------------------§f\n`,
        `§6${member.name}'検知内容 §f\n`,
    ];

    switch (true) {
        case member.hasTag("paradoxFreeze"):
            reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§f凍結内容＝＞ ${member.hasTag("freezeAura") ? "AntiKillAura" : member.hasTag("freezeNukerA") ? "AntiNukerA" : member.hasTag("freezeScaffoldA") ? "AntiScaffoldA" : "Staff"}`);
            break;
        case member.hasTag("flying"):
            reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§f 飛んでます`);
            break;
        case member.hasTag("vanish"):
            reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§f 透明`);
            break;
    }

    allObjectives.forEach((objective) => {
        const score = ScoreManager.getScore(objective, member);
        if (score > 0) {
            reportBody.push(`§f§4[§6${objective.replace("vl", "").toUpperCase()}§4]§f 検知回数＝＞: §7${score}§f\n`);
        }
    });
    reportBody.push(`§f§4--------------------------------§f\n`);

    const equipment = member.getComponent("equippable") as EntityEquippableComponent;
    const helmet = equipment.getEquipment(EquipmentSlot.Head);
    const chest = equipment.getEquipment(EquipmentSlot.Chest);
    const legs = equipment.getEquipment(EquipmentSlot.Legs);
    const feet = equipment.getEquipment(EquipmentSlot.Feet);
    const mainhand = equipment.getEquipment(EquipmentSlot.Mainhand);
    const offhand = equipment.getEquipment(EquipmentSlot.Offhand);

    const materialColors: { [key: string]: string } = {
        golden: "§6", // gold
        iron: "§7", // light gray
        diamond: "§b", // aqua
        leather: "§e", // yellow
        chainmail: "§8", // dark gray
        turtle: "§a", // green
        netherite: "§4", // dark red
        elytra: "§5", // purple
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
        const enchantedEquipment = verification.getComponent("enchantments") as ItemEnchantsComponent;
        const enchantList = enchantedEquipment.enchantments;
        if (!enchantList) {
            continue;
        }
        let isEnchanted = false;
        for (const enchant in MinecraftEnchantmentTypes) {
            const enchantNumber = enchantList.hasEnchantment(MinecraftEnchantmentTypes[enchant as keyof typeof MinecraftEnchantmentTypes]);
            if (enchantNumber > 0) {
                isEnchanted = true;
            }
        }
        let materialType = verification.typeId.split(":")[1].replace(/_\w+/, "");
        if (armorType === "Mainhand" || armorType === "Offhand") {
            materialType = verification.typeId.split(":")[1];
        }
        const materialColor = materialColors[materialType] || materialColors["none"];
        reportBody.push(`§7${armorType}§f: ${isEnchanted ? "§aエンチャ有§f" : "§4エンチャなし§f"} || ${materialColor}${materialType}\n`);
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