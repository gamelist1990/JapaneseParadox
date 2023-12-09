import { ChatSendAfterEvent, Player, Vector3 } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import { ScoreManager } from "../../classes/ScoreManager.js";
import ConfigInterface from "../../interfaces/Config.js";

function modulesHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: モジュール`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: モジュール [オプション］`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6説明§4]§fParadox でBooleanになっているモジュールと無効になっているモジュールの一覧を表示します。`,
        `§4[§6例§4]§f`,
        `${prefix}modules`,
        `        §4- §6 Boolean・無効なモジュールのリストを表示する§f`,
        `    ${prefix}modules help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name module
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function modules(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/modules.js:28)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.modules) {
        return modulesHelp(player, prefix, configuration.customcommands.modules);
    }

    // 得点
    const commandblocks = ScoreManager.getScore("commandblocks", player);
    const cmds = ScoreManager.getScore("cmds", player);
    const encharmor = ScoreManager.getScore("encharmor", player);
    const antikb = ScoreManager.getScore("antikb", player);

    // ブーリアン
    const worldBorderBoolean = configuration.modules.worldBorder.enabled;
    const xrayABoolean = configuration.modules.xrayA.enabled;
    const opsBoolean = configuration.modules.ops.enabled;
    const speedABoolean = configuration.modules.speedA.enabled;
    const nameSpoofABoolean = configuration.modules.namespoofA.enabled;
    const nameSpoofBBoolean = configuration.modules.namespoofB.enabled;
    const jesusABoolean = configuration.modules.jesusA.enabled;
    const InvalidSprintABoolean = configuration.modules.invalidsprintA.enabled;
    const illegalItemsABoolean = configuration.modules.illegalitemsA.enabled;
    const illegalItemsCBoolean = configuration.modules.illegalitemsC.enabled;
    const hotbarBoolean = configuration.modules.hotbar.enabled;
    const adventureGMBoolean = configuration.modules.adventureGM.enabled;
    const creativeGMBoolean = configuration.modules.creativeGM.enabled;
    const survivalGMBoolean = configuration.modules.survivalGM.enabled;
    const flyABoolean = configuration.modules.flyA.enabled;
    const bedrockValidateBoolean = configuration.modules.bedrockValidate.enabled;
    const reachBBoolean = configuration.modules.reachB.enabled;
    const antiScaffoldABoolean = configuration.modules.antiscaffoldA.enabled;
    const reachABoolean = configuration.modules.reachA.enabled;
    const illegalItemsBBoolean = configuration.modules.illegalitemsB.enabled;
    const antiNukerABoolean = configuration.modules.antinukerA.enabled;
    const spammerCBoolean = configuration.modules.spammerC.enabled;
    const spammerBBoolean = configuration.modules.spammerB.enabled;
    const spammerABoolean = configuration.modules.spammerA.enabled;
    const badPackets1Boolean = configuration.modules.badpackets1.enabled;
    const savageBoolean = configuration.modules.salvage.enabled;
    const illegalLoresBoolean = configuration.modules.illegalLores.enabled;
    const illegalEnchantmentBoolean = configuration.modules.illegalEnchantment.enabled;
    const lockdownBoolean = configuration.modules.lockdown.enabled;
    const antiShulkerBoolean = configuration.modules.antishulker.enabled;
    const chatranksBoolean = configuration.modules.chatranks.enabled;
    const stackBanBoolean = configuration.modules.stackBan.enabled;
    const badPackets2Boolean = configuration.modules.badpackets2.enabled;
    const antiSpamBoolean = configuration.modules.antispam.enabled;
    const clearLagBoolean = configuration.modules.clearLag.enabled;
    const antiFallABoolean = configuration.modules.antifallA.enabled;
    const showrulesBoolean = configuration.modules.showrules.enabled;
    const autobanBoolean = configuration.modules.autoBan.enabled;
    const autoclickerBoolean = configuration.modules.autoclicker.enabled;
    const antiKillAuraBoolean = configuration.modules.antiKillAura.enabled;
    const afkBoolean = configuration.modules.afk.enabled;
    const antiPhaseABoolean = configuration.modules.antiphaseA.enabled;
    const spawnprotectionBoolean = configuration.modules.spawnprotection.enabled;

    // 数字
    const worldBorderOverworldNumber = configuration.modules.worldBorder.overworld;
    const worldBorderNetherNumber = configuration.modules.worldBorder.nether;
    const worldBorderEndNumber = configuration.modules.worldBorder.end;
    const spawnProtectionRadius = configuration.modules.spawnprotection.radius;

    //ベクター
    const spawnProtectionVector3 = configuration.modules.spawnprotection.vector3;

    const status = (b: string | number | boolean | Vector3) => (b ? "§aBoolean" : "§4無効");

    sendMsgToPlayer(player, [
        `§f§4[§6Paradox§4]§f モジュールのリスト．`,
        `§o§6|§f Anti-GMA: ${status(adventureGMBoolean)}`,
        `§o§6|§f Anti-GMS: ${status(survivalGMBoolean)}`,
        `§o§6|§f Anti-GMC: ${status(creativeGMBoolean)}`,
        `§o§6|§f Badpackets: ${status(badPackets1Boolean)}`,
        `§o§6|§f SpammerA: ${status(spammerABoolean)}`,
        `§o§6|§f SpammerB: ${status(spammerBBoolean)}`,
        `§o§6|§f SpammerC: ${status(spammerCBoolean)}`,
        `§o§6|§f Anti-Spam: ${status(antiSpamBoolean)}`,
        `§o§6|§f NamespoofA: ${status(nameSpoofABoolean)}`,
        `§o§6|§f NamespoofB: ${status(nameSpoofBBoolean)}`,
        `§o§6|§f Bedrock: ${status(bedrockValidateBoolean)}`,
        `§o§6|§f ReachA: ${status(reachABoolean)}`,
        `§o§6|§f ReachB: ${status(reachBBoolean)}`,
        `§o§6|§f JesusA: ${status(jesusABoolean)}`,
        `§o§6|§f SpeedA: ${status(speedABoolean)}`,
        `§o§6|§f InvalidSprintA: ${status(InvalidSprintABoolean)}`,
        `§o§6|§f FlyA: ${status(flyABoolean)}`,
        `§o§6|§f AntiFallA: ${status(antiFallABoolean)}`,
        `§o§6|§f IllegalItemsA: ${illegalItemsABoolean ? `§aBoolean§f [Ban Illegal Stacks: ${status(stackBanBoolean)}§f]` : "§4無効"}.`,
        `§o§6|§f IllegalItemsB: ${illegalItemsBBoolean ? `§aBoolean§f [Ban Illegal Stacks: ${status(stackBanBoolean)}§f]` : "§4無効"}.`,
        `§o§6|§f IllegalItemsC: ${status(illegalItemsCBoolean)}`,
        `§o§6|§f IllegalEnchantments: ${status(illegalEnchantmentBoolean)}`,
        `§o§6|§f IllegalLores: ${status(illegalLoresBoolean)}`,
        `§o§6|§f Anti-ScaffoldA: ${status(antiScaffoldABoolean)}`,
        `§o§6|§f Anti-NukerA: ${status(antiNukerABoolean)}`,
        `§o§6|§f XrayA: ${status(xrayABoolean)}`,
        `§o§6|§f Chat: ${status(chatranksBoolean)}`,
        `§o§6|§f Anti-Shulkers: ${status(antiShulkerBoolean)}`,
        `§o§6|§f Hotbar: ${status(hotbarBoolean)}`,
        `§o§6|§f OPS: ${status(opsBoolean)}`,
        `§o§6|§f Salvage: ${status(savageBoolean)}`,
        `§o§6|§f Lockdown: ${status(lockdownBoolean)}`,
        `§o§6|§f Badpackets2: ${status(badPackets2Boolean)}`,
        `§o§6|§f OverideCommandBlocksBoolean: ${status(cmds)}`,
        `§o§6|§f RemoveCommandBlocks: ${status(commandblocks)}`,
        `§o§6|§f Anti-Knockback: ${status(antikb)}`,
        `§o§6|§f Anti-KillAura: ${status(antiKillAuraBoolean)}`,
        `§o§6|§f Anti-Enchanted: ${status(encharmor)}`,
        `§o§6|§f Autoclicker: ${status(autoclickerBoolean)}`,
        `§o§6|§f World Border: ${worldBorderBoolean ? `§aBoolean§f (Overworld: §6${worldBorderOverworldNumber}§f Nether: §6${worldBorderNetherNumber}§f End: §6${worldBorderEndNumber}§f)` : "§4無効"}.`,
        `§o§6|§f ClearLag: ${status(clearLagBoolean)}`,
        `§o§6|§f ShowRules: ${status(showrulesBoolean)}`,
        `§o§6|§f AutoBan: ${status(autobanBoolean)}`,
        `§o§6|§f AFK: ${status(afkBoolean)}`,
        `§o§6|§f AntiPhaseA: ${status(antiPhaseABoolean)}`,
        `§o§6|§f Spawn Protection: ${spawnprotectionBoolean ? `§aBoolean§f (X: §6${spawnProtectionVector3.x}§f Y: §6${spawnProtectionVector3.y}§f Z: §6${spawnProtectionVector3.z}§f Radius: §6${spawnProtectionRadius}§f)` : "§4無効"}.`,
    ]);
}
