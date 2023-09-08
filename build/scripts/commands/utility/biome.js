import config from "../../data/config.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
function biomeHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.biome) {
        commandStatus = "§6[§4DISABLED§6]§f";
    }
    else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: biome`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Usage§4]§f: biome [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Sends the current biome and direction the player is facing. §6Note you need to enable Molang. `,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}biome`,
        `        §4- §6Send the current biome and direction to the player§f`,
        `    ${prefix}biome help`,
        `        §4- §6Show command help§f`,
    ]);
}
/**
 * @name biome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function biome(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/biome.js:26)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.biome) {
        return biomeHelp(player, prefix);
    }
    const directionMap = new Map([
        ["North", "向いている方角: 北"],
        ["South", "向いている方角: 南"],
        ["East", "向いている方角: 東"],
        ["West", "向いている方角: 西"],
    ]);
    const defaultDirection = "Facing: Unknown!";
    let direction;
    // Iterate over the map entries to find a matching tag
    for (const [tag, mappedDirection] of directionMap.entries()) {
        if (player.hasTag(tag)) {
            direction = mappedDirection;
            break;
        }
    }
    // If no matching tag is found, assign the default direction
    if (!direction) {
        direction = defaultDirection;
    }
    //Biome Map
    const biomeMap = new Map([
        ["basalt_deltas", "バイオーム: ネザーの玄武岩の三角州"],
        ["bamboo_jungle", "バイオーム: まばらなジャングル "],
        ["bamboo_jungle_hills", "バイオーム: 竹林"],
        ["beach", "バイオーム: ビーチ"],
        ["birch_forest", "バイオーム: 白樺の森"],
        ["birch_forest_hills", "バイオーム: ちょい崖の白樺の森"],
        ["birch_forest_hills_mutated", "バイオーム: 白樺の森の丘の突然変異!?"],
        ["birch_forest_mutated", "バイオーム: 白樺の森の変異！？"],
        ["cold_beach", "バイオーム: 雪のビーチ"],
        ["cold_ocean", "バイオーム: 冷たい海洋"],
        ["cold_taiga", "バイオーム: 雪のタイガ"],
        ["cold_taiga_hills", "バイオーム: ちょい崖のタイガ"],
        ["cold_taiga_mutated", "バイオーム: 崖タイガw"],
        ["crimson_forest", "バイオーム: ネザー真紅の森"],
        ["deep_cold_ocean", "バイオーム: 冷たい深海"],
        ["deep_frozen_ocean", "バイオーム: 凍った深海"],
        ["deep_lukewarm_ocean", "バイオーム: ぬるい深海"],
        ["deep_ocean", "バイオーム: ただの深海"],
        ["deep_warm_ocean", "バイオーム: 深海【海底神殿あるかも？】"],
        ["desert", "バイオーム: 砂漠～"],
        ["desert_hills", "バイオーム: 砂漠の崖～"],
        ["desert_mutated", "バイオーム: 崖砂漠～"],
        ["extreme_hills_edge", "バイオーム: 吹きさらしの谷～"],
        ["extreme_hills_mutated", "バイオーム: エメラルドが取れそうな山"],
        ["extreme_hills_plus_trees", "バイオーム: 山岳"],
        ["extreme_hills_plus_trees_mutated", "バイオーム: 森のある山"],
        ["flower_forest", "バイオーム: 花の森"],
        ["forest", "バイオーム: ただの森"],
        ["forest_hills", "バイオーム: ちょい崖の森"],
        ["frozen_ocean", "バイオーム: 凍った海"],
        ["frozen_river", "バイオーム: 凍った川"],
        ["ice_mountains", "バイオーム: 氷の山【スキーできるね！】"],
        ["ice_plains", "バイオーム: 氷原"],
        ["ice_plains_spikes", "バイオーム: 氷原のトラップ"],
        ["jungle", "バイオーム: ただのジャングル"],
        ["jungle_edge", "バイオーム: ジャングルエッジ～"],
        ["jungle_edge_mutated", "バイオーム: 変異したジャングル・エッジ～"],
        ["jungle_hills", "バイオーム: ジャングル・ヒルズ"],
        ["jungle_mutated", "バイオーム: ジャングルの突然変異！？"],
        ["legacy_frozen_ocean", "バイオーム:シロクマさんがスポーンする凍った海"],
        ["lofty_peaks", "バイオーム: 雪山岳"],
        ["lukewarm_ocean", "バイオーム: ぬるい海"],
        ["mega_spruce_taiga", "バイオーム: トウヒの原生林"],
        ["mega_spruce_taiga_hills", "バイオーム: 寒いタイガの原生林"],
        ["mega_taiga", "バイオーム: 巨大なタイガの原生林"],
        ["mega_taiga_hills", "バイオーム: 巨大なトウヒの森！"],
        ["mesa", "バイオーム: メサ"],
        ["mesa_bryce", "バイオーム: メサブライス"],
        ["mesa_plateau", "バイオーム: メサ高原"],
        ["mesa_plateau_mutated", "バイオーム:メサ高原の突然変異"],
        ["mesa_plateau_stone", "バイオーム: 石テーブルトップ"],
        ["mesa_plateau_stone_mutated", "バイオーム: メサ・プラトー・ストーン"],
        ["mountain_grove", "バイオーム: マウンテン・グローブ"],
        ["mountain_meadow", "バイオーム: マウンテン・メドウ"],
        ["mountain_peaks", "バイオーム: 山頂"],
        ["mushroom_island", "バイオーム: マッシュルーム・アイランド"],
        ["mushroom_island_shore", "バイオーム:マッシュルーム・アイランド・ショア"],
        ["nether_wastes", "バイオーム: ネザーの荒地"],
        ["ocean", "バイオーム: 海"],
        ["plains", "バイオーム: 平野"],
        ["river", "バイオーム: 川"],
        ["roofed_forest_mutated", "バイオーム: 変異した屋根のある森"],
        ["savanna", "バイオーム: サバンナ"],
        ["savanna_mutated", "バイオーム:サバンナ"],
        ["savanna_plateau", "バイオーム:サバンナ"],
        ["savanna_plateau_mutated", "バイオーム:サバンナ"],
        ["snow_capped_peaks", "バイオーム: 雪に覆われた山々"],
        ["snowy_slopes", "バイオーム: 雪の坂道"],
        ["soulsand_valley", "バイオーム:ネザーのソウルサンド地帯"],
        ["stone_beach", "バイオーム: 石浜"],
        ["sunflower_plains", "バイオーム:ひまわり平野"],
        ["swamp", "バイオーム: 沼地"],
        ["swamp_mutated", "バイオーム: 沼地"],
        ["taiga", "バイオーム: タイガ"],
        ["taiga_hills", "バイオーム: タイガ"],
        ["taiga_mutated", "バイオーム: タイガ"],
        ["the_end", "バイオーム: エンド！！"],
        ["warm_ocean", "バイオーム: 暖かい海"],
        ["warped_forest", "バイオーム: 歪んだ森"],
        ["deep_dark", "バイオーム: 深い闇"],
        ["lush_caves", "バイオーム: 豊かな洞窟"],
        ["jagged_peaks", "バイオーム: 緑豊かな鍾乳洞"],
        ["dripstone_caves", "バイオーム: ドリップストーン洞窟"],
        ["meadow", "バイオーム: 草地"],
        ["mangrove_swamp", "バイオーム: マングローブ湿地"],
        ["cherry_grove", "バイオーム: チェリー・グローブ"],
        ["roofed_forest", "バイオーム: 屋根の森"],
        ["grove", "バイオーム: グローブ"],
        ["stony_peaks", "バイオーム: ストーニー・ピークス"],
    ]);
    const defaultBiome = "Unknown Or §4Molang is not enabled!§f";
    let currentBiome;
    // Iterate over the map entries to find a matching tag
    for (const [tag, mappedBiome] of biomeMap.entries()) {
        if (player.hasTag(tag)) {
            currentBiome = mappedBiome;
            break;
        }
    }
    // If no matching tag is found, assign the default biome
    if (!currentBiome) {
        currentBiome = defaultBiome;
    }
    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${currentBiome} \n§f§4[§6Paradox§4]§f ${direction}`);
}
