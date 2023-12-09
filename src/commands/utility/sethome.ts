import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Saves a home location for a player
 *
 * @param player - The player whose home is being saved
 * @param args - Array containing arguments, including the name of the home
 * @param configuration - Configuration settings
 * @returns void
 */
function saveHome(player: Player, args: string[], configuration: ConfigInterface): void {
    // 現在位置の取得
    const { x, y, z } = player.location;

    const homex = x.toFixed(0);
    const homey = y.toFixed(0);
    const homez = z.toFixed(0);
    let currentDimension: string;

    args = args.slice(1);

    // スペースを許可しない
    if (args.length > 1 || args[0].trim().length === 0) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前にスペースを入れないでください！`);
        return;
    }

    // 安全のために座標をハッシュ化する
    const salt = world.getDynamicProperty("crypt");

    // Make sure this name doesn'それはすでに存在しない。't exceed limitations
    let verify = false;
    let counter = 0;
    const tags = player.getTags();
    const tagsLength = tags.length;
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            // すでに存在するかどうかを確認するために、デコードする。
            tags[i] = (world as WorldExtended).decryptString(tags[i], String(salt));
        }
        if (tags[i].startsWith(args[0].toString() + " X", 13)) {
            verify = true;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Home with name '§7${args[0]}§f' already exists!`);
            break;
        }
        if (tags[i].startsWith("LocationHome:")) {
            counter = ++counter;
        }
        if (counter >= configuration.modules.setHome.max) {
            verify = true;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You can only have §7${configuration.modules.setHome.max}§f saved locations at a time!`);
            break;
        }
    }
    if (verify === true) {
        return;
    }

    // どの次元にいるかを保存する
    if (player.dimension.id === "minecraft:overworld") {
        currentDimension = "overworld";
    }
    if (player.dimension.id === "minecraft:nether") {
        currentDimension = "nether";
    }
    if (player.dimension.id === "minecraft:the_end") {
        currentDimension = "the_end";
    }

    const decryptedLocationString = `LocationHome:${args[0]} X:${homex} Y:${homey} Z:${homez} Dimension:${currentDimension}`;
    const security = (world as WorldExtended).encryptString(decryptedLocationString, salt as string);
    // 新居のコーディネートを収納する
    player.addTag(security);

    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Home '§7${args[0]}§f' has been set at §7${homex} ${homey} ${homez}§f!`);
}

/**
 * Provides help information for the sethome command
 *
 * @param player - The player to whom the help information is sent
 * @param prefix - Prefix used in commands
 * @param configuration - Configuration settings
 */
function setHomeHelp(player: Player, prefix: string, configuration: ConfigInterface) {
    const commandStatus: string = configuration.customcommands.sethome ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    return sendMsgToPlayer(player, [
        `§n§o§4[§6コマンド§4]§f：セットホーム`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: sethome [オプション］`,
        `§4[§6Description§4]§f: Saves home location based on current coordinates. Up to ${configuration.modules.setHome.max} total.`,
        `§4[§6オプション§4]§f：`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -n <値>, --name <値>.`,
        `       §4[§7現在位置を名前付きで保存§4]§f`,
        `    -m <値>, --max <値>。`,
        `       §4[§7許可される住宅数の上限を設定する§4]§f`,
        `    -e, --enable`,
        `       §4[§7SetHomeコマンドをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7SetHomeコマンドを無効にする§4]§f`,
        `    -s, --status`,
        `       §4[§7セットホーム§4の現在のステータスを表示する]§f`,
        `§4[§6例§4]§f：`,
        `    ${prefix}sethome --name barn`,
        `    ${prefix}sethome --help`,
        `    ${prefix}sethome --max ${configuration.modules.setHome.max}`,
        `    ${prefix}sethome --disable`,
        `    ${prefix}sethome --enable`,
        `    ${prefix}sethome --status`,
    ]);
}

/**
 * @name sethome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function sethome(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/sethome.js:26)");
    }

    const player = message.sender;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const hasPermission = dynamicPropertyRegistry.getProperty(player, player?.id);

    if (!configuration.customcommands.sethome && !hasPermission) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fセットホームは現在無効です。`);
    }

    // 位置以外の引数をチェックする
    if (args.length > 0) {
        const additionalArg: string = args[0].toLowerCase();

        // 追加引数の処理
        switch (additionalArg) {
            case "-h":
            case "--help":
                return setHomeHelp(player, prefix, configuration);
            case "-s":
            case "--status":
                // ハンドル状態フラグ
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f SetHome is currently ${configuration.customcommands.sethome ? "Boolean" : "無効"}`);
                break;
            case "-e":
            case "--enable":
                // ハンドルイネーブルフラグ
                if (configuration.customcommands.sethome) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f既に SetHome がBooleanになっている。`);
                } else {
                    if (!hasPermission) {
                        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f failed to enable §6SetHome§f! No permissions.`);
                        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f§6SetHome§fをBooleanにするには、Paradox-Oppedにする必要がある。`);
                    }
                    configuration.customcommands.sethome = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 以下の機能が有効です=> §6SetHome§f!`);
                }
                break;
            case "-d":
            case "--disable":
                // ハンドル無効フラグ
                if (!configuration.customcommands.sethome) {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fセットホームは既に無効になっている。`);
                } else {
                    if (!hasPermission) {
                        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f failed to disable §6SetHome§f! No permissions.`);
                        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f§6SetHome§fを無効にするには、Paradox-Oppedにする必要がある。`);
                    }
                    configuration.customcommands.sethome = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4SetHome§f!`);
                }
                break;
            case "-m":
            case "--max": {
                // ハンドル最大フラグ
                if (!hasPermission) {
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f failed to set max allowed for §6SetHome§f! No permissions.`);
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f§6SetHome§fの最大許容値を設定するには、Paradox-Oppedである必要がある。`);
                }
                const numberConvert = Number(args[1]);
                if (isNaN(numberConvert)) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid option. Use ${prefix}sethome --help for more information.`);
                }
                configuration.modules.setHome.max = numberConvert;
                dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f has set §6SetHome§f max allowed to §6${numberConvert}§f!`);
                break;
            }
            case "-n":
            case "--name":
                // ハンドル名フラグ
                saveHome(player, args, configuration);
                break;
            default:
                // 認識できないフラグの処理
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid option. Use ${prefix}sethome --help for more information.`);
                break;
        }
    } else {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}sethome --help for more information.`);
    }
}
