import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";
function biomeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `§6コマンド§4]§f：バイオーム`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f：バイオーム[オプション］`,
        `§4[§6オプション§4]§f: ヘルプ`,
        `§4[§6解説§4]§f：現在のバイオームとプレイヤーが向いている方向を送信する。§6MolangをBooleanにする必要があることに注意。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}biome`,
        `        §4- §6現在のバイオームと方向をプレイヤーに送る§f`,
        `    ${prefix}biome help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}
/**
 * @name biome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function biome(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./utility/biome.js:26)");
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
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.biome) {
        return biomeHelp(player, prefix, configuration.customcommands.biome);
    }
    const directionMap: Map<string, string> = new Map([
        ["North", "向いている方角: 北"],
        ["South", "向いている方角: 南"],
        ["East", "向いている方角: 東"],
        ["West", "向いている方角: 西"],
    ]);
    const defaultDirection: string = "検知できません！！";
    let direction: string;
    // 一致するタグを見つけるために、マップのエントリーを繰り返し処理する。
    for (const [tag, mappedDirection] of directionMap.entries()) {
        if (player.hasTag(tag)) {
            direction = mappedDirection;
            break;
        }
    }
    // 一致するタグが見つからない場合は、デフォルトの方向を割り当てる。
    if (!direction) {
        direction = defaultDirection;
    }
    //バイオームマップ
    const biomeMap: Map<string, string> = new Map([
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

    const defaultBiome: string = "Unknown Or §4Molang is not Boolean!§f";
    let currentBiome: string;
    // 一致するタグを見つけるために、マップのエントリーを繰り返し処理する。
    for (const [tag, mappedBiome] of biomeMap.entries()) {
        if (player.hasTag(tag)) {
            currentBiome = mappedBiome;
            break;
        }
    }
    // 一致するタグが見つからない場合は、デフォルトのバイオームを割り当てる。
    if (!currentBiome) {
        currentBiome = defaultBiome;
    }

    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${currentBiome} \n§f§4[§6Paradox§4]§f ${direction}`);
}
