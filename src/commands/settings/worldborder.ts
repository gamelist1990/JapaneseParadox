import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { WorldBorder } from "../../penrose/TickEvent/worldborder/worldborder.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Provides help information for the worldborders command.
 * @param {Player} player - The player requesting help.
 * @param {string} prefix - The custom prefix for the player.
 * @param {boolean} worldBorder.enabled - The status of the worldBorder module.
 * @param {boolean} setting - The status of the worldBorder custom command setting.
 */
function worldBorderHelp(player: Player, prefix: string, worldBorderBoolean: boolean, setting: boolean): void {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = worldBorderBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `\n[§6コマンド§4]§f: ワールドボーダー`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}worldborder [options]`,
        `§4[§6解説§4]§f：ワールドの境界線を設定し、プレイヤーをその境界線に制限します。`,
        `§4[§6オプション§4]§f：`,
        `    -オーバーワールド`,
        `       §4[§7オーバーワールドの境界線の大きさを設定する§4]§f`,
        `    -n, --nether`,
        `       §4[§7境界線の大きさを設定する§4]§f`,
        `    -e, --end`,
        `       §4[§7エンドボーダーのサイズを設定する§4]§f`,
        `    -d, --disable`,
        `       §4[§7ワールド・ボーダーを無効にする§4]§f`,
        `    -e, --enable`,
        `       §4[§7ワールド・ボーダーをBooleanにする§4]§f`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
    ]);
}

/**
 * Sets the world border sizes and enables the worldBorder module.
 * @param {Player} player - The player who is setting the world border.
 * @param {number} overworldSize - The size of the overworld border.
 * @param {number} netherSize - The size of the nether border.
 * @param {number} endSize - The size of the end border.
 * @param {ConfigInterface} configuration - The configuration object.
 */
function setWorldBorder(player: Player, overworldSize: number, netherSize: number, endSize: number, configuration: ConfigInterface): void {
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set the §6World Border§f! Overworld: §7${overworldSize}§f Nether: §7${netherSize}§f End: §7${endSize}§f`);
    configuration.modules.worldBorder.overworld = Math.abs(overworldSize);
    configuration.modules.worldBorder.nether = Math.abs(netherSize);
    configuration.modules.worldBorder.end = Math.abs(endSize);
    configuration.modules.worldBorder.enabled = true;
    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
    WorldBorder();
}

/**
 * Parses a string value into a number, ensuring it is a valid number.
 * @param {string | undefined} value - The string value to parse.
 * @returns {number | undefined} - The parsed positive number.
 */
function parseSize(value: string | undefined): number | undefined {
    // 文字列値を数値に変換しようとする。
    const parsedValue = Number(value);

    // 変換結果がBooleanな数値かどうかをチェックする
    if (isNaN(parsedValue)) {
        return undefined;
    }

    // 解析された正の数を返す
    return Math.abs(parsedValue);
}

/**
 * Handles the worldborders command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function worldborders(message: ChatSendAfterEvent, args: string[]): void {
    handleWorldBorders(message, args).catch((error) => {
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

/**
 * Handles the worldborders command.
 * @param {ChatSendAfterEvent} message - Message object.
 * @param {string[]} args - Additional arguments provided (optional).
 */
async function handleWorldBorders(message: ChatSendAfterEvent, args: string[]): Promise<void> {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | Error: ${message} isn't defined. Did you forget to pass it? (./commands/settings/worldborder.js:38)`);
    }

    const player: Player = message.sender;
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    const prefix: string = getPrefix(player);
    const configuration: ConfigInterface = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // キャッシュ
    const length = args.length;

    if (length <= 0 || ["--help", "-h"].includes(args[0].toLowerCase()) || !configuration.customcommands.worldborder) {
        return worldBorderHelp(player, prefix, configuration.modules.worldBorder.enabled, configuration.customcommands.worldborder);
    }

    // ワールドボーダーを閉鎖
    if (length <= 0 || ["--disable", "-d"].includes(args[0].toLowerCase())) {
        // ワールドボーダーを無効にする
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 the §6World Border§f!`);
        configuration.modules.worldBorder.overworld = 0;
        configuration.modules.worldBorder.nether = 0;
        configuration.modules.worldBorder.end = 0;
        configuration.modules.worldBorder.enabled = false;
        return;
    }

    // ワールドボーダーをBooleanにする
    if (length <= 0 || ["--enable", "-e"].includes(args[0].toLowerCase())) {
        const o = configuration.modules.worldBorder.overworld;
        const n = configuration.modules.worldBorder.nether;
        const e = configuration.modules.worldBorder.end;
        if (!configuration.modules.worldBorder.enabled && (o !== 0 || n !== 0 || e !== 0)) {
            // ワールドボーダーをBooleanにする
            configuration.modules.worldBorder.enabled = true;
            dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
            sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> the §6World Border§f!`);
            WorldBorder();
            return;
        } else {
            const noBorders = o === 0 && n === 0 && e === 0;
            if (noBorders) {
                return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Set the border size please. Use ${prefix}worldborder --help for command usage.`);
            }
            return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fワールド・ボーダーは既にBooleanになっている。`);
        }
    }

    let overworldSize = configuration.modules.worldBorder.overworld || 0;
    let netherSize = configuration.modules.worldBorder.nether || 0;
    let endSize = configuration.modules.worldBorder.end || 0;

    for (let i = 0; i < length; i++) {
        const arg = args[i].toLowerCase();
        switch (arg) {
            case "--overworld":
            case "-o":
                overworldSize = parseSize(args[i + 1]);
                break;
            case "--nether":
            case "-n":
                netherSize = parseSize(args[i + 1]);
                break;
            case "--end":
            case "-e":
                endSize = parseSize(args[i + 1]);
                break;
        }
    }

    if (overworldSize || netherSize || endSize) {
        setWorldBorder(player, overworldSize as number, netherSize as number, endSize as number, configuration);
        return;
    }

    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}worldborder --help for command usage.`);
}
