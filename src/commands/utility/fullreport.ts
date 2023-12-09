import { ChatSendAfterEvent, EntityEquippableComponent, EquipmentSlot, ItemEnchantsComponent, ItemStack, Player, world } from "@minecraft/server";
import { MinecraftEnchantmentTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { ScoreManager } from "../../classes/ScoreManager";
import { PlayerExtended } from "../../classes/PlayerExtended/Player";
import ConfigInterface from "../../interfaces/Config";

function fullReportHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§6コマンド§4]§f：フルレポート`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: fullreport [オプション].`,
        `§4[§6オプション§4]§f: ユーザー名、ヘルプ`,
        `§4[§6解説§4]§f：現在オンラインになっているすべてのプレイヤーのログを見る。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}fullreport`,
        `        §4- §6 現在オンライン中の全プレーヤーのログを見る§f`,
        `    ${prefix}fullreport help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name fullreport
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function fullreport(message: ChatSendAfterEvent, args: string[]) {
    handleFullReport(message, args).catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}

async function handleFullReport(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/fullreport.js:28)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.fullreport) {
        return fullReportHelp(player, prefix, configuration.customcommands.fullreport);
    }

    if (!player.hasTag("notify")) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fチート通知をBooleanにする必要があります。`);
    }

    const players = world.getPlayers();
    for (const member of players) {
        const reportBody = [
            `\n§f§4[§6Paradox§4]§f 以下のプレイヤーからParadox Logsを取得中: §6${member.name}§f`,
            `§r§4[§6Paradox§4]§r §6${member.name}§rのプレイヤーIDは【 ${member.id} 】です`,
            `§f§4[§6Paradox§4]§f §6${member.name}§fのゲームモード: §7${(member as PlayerExtended).getGameMode()}§f`,
            `§f§4[§6Paradox§4]§f §6${member.name}§fの現在位置 X= §7${member.location.x.toFixed(0)}§f Y= §7${member.location.y.toFixed(0)}§f Z= §7${member.location.z.toFixed(0)}§f`,
        ];

        switch (true) {
            case member.hasTag("paradoxFreeze"):
                reportBody.push(
                    `§f§4[§6Paradox§4]§f §6${member.name}§fは${member.hasTag("freezeAura") ? "AntiKillAura" : member.hasTag("freezeNukerA") ? "AntiNukerA" : member.hasTag("freezeScaffoldA") ? "AntiScaffoldA" : "Staff"}によってフリーズされています`
                );
                break;
            case member.hasTag("flying"):
                reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§fは飛んでいます`);
                break;
            case member.hasTag("vanish"):
                reportBody.push(`§f§4[§6Paradox§4]§f §6${member.name}§fは消えています`);
                break;
        }

        let violationsFound = 0;
        let vlCount = 0;
        let divider = false;
        ScoreManager.allscores.forEach((objective) => {
            vlCount++;
            const score = ScoreManager.getScore(objective, member);
            if (score > 0) {
                violationsFound++;
                if (violationsFound === 1) {
                    divider = true;
                    reportBody.push(`§f§4[§6Paradox§4]§4 ----------------------------------§f`);
                }
                reportBody.push(`§f§4[§6Paradox§4]§f §f§4[§6${objective.replace("vl", "").toUpperCase()}§4]§f 違反数: §7${score}§f`);
            }
            if (vlCount === ScoreManager.allscores.length && divider === true) {
                reportBody.push(`§f§4[§6Paradox§4]§4 ----------------------------------§f`);
            }
        });

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
            [helmet, "ヘルメット"],
            [chest, "チェストプレート"],
            [legs, "レギンス"],
            [feet, "ブーツ"],
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
            if (armorType === "メインハンド" || armorType === "オフハンド") {
                materialType = verification.typeId.split(":")[1];
            }
            const materialColor = materialColors[materialType] || materialColors["none"];
            reportBody.push(`§f§4[§6Paradox§4]§f §7${armorType}§f: ${isEnchanted ? "§aエンチャント済み§f" : "§4エンチャント未済み§f"} || ${materialColor}${materialType}`);
        }

        sendMsgToPlayer(player, reportBody);
    }
}
