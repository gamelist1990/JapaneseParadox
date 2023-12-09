import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { ChatSendAfterEvent, Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { SpawnProtection } from "../../penrose/TickEvent/spawnprotection/spawnProtection.js";
import ConfigInterface from "../../interfaces/Config.js";

function spawnprotectionHelp(player: Player, prefix: string, spawnprotectionBoolean: boolean, setting: boolean) {
    // コマンドとモジュールのステータスを決定する
    const commandStatus: string = setting ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";
    const moduleStatus: string = spawnprotectionBoolean ? "§6[§a有効§6]§f" : "§6[§4無効§6]§f";

    // 選手にヘルプ情報を表示する
    sendMsgToPlayer(player, [
        `§6コマンド§4]§f：スポーンプロテクション`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: ${prefix}spawnprotection [options]`,
        `§4[§6解説§4]§f：建築/採掘を制限するためにエリアの保護をトグルする。`,
        `§4[§6オプション§4]§f：`,
        `    -e, --enable`,
        `       §4[§7スポーンプロテクションをBooleanにする§4]§f`,
        `    -d, --disable`,
        `       §4[§7スポーンプロテクションを無効にする§4]§f`,
        `    -h, --help`,
        `       §4[§7このヘルプメッセージを表示する§4]§f`,
        `    -s, --status`,
        `       §4[§7スタック禁止モジュールの現在の状態を表示する§4]§f`,
        `    -c <x> <y> <z>, --center <x> <y> <z>`,
        `       §4[§7中心座標でスポーンプロテクションを設定する§4]§f`,
        `    -r <r>, --radius <r>`,
        `       §4[§7中心を基準にしたスポーン保護半径の設定§4]§f`,
    ]);
}

/**
 * @name spawnprotection
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function spawnprotection(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/moderation/spawnprotection.js:36)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うには、Paradox-Oppedである必要がある。`);
    }

    // ダイナミック・プロパティ・ブール値の取得
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 位置以外の引数をチェックする
    const length = args.length;
    let validFlagFound = false; // Flag to track if any valid flag is encountered
    let updates = false; // Flag to track if vec3 or rad is modified
    for (let i = 0; i < length; i++) {
        const additionalArg: string = args[i].toLowerCase();

        // 追加引数の処理
        switch (additionalArg) {
            case "-h":
            case "--help":
                // ヘルプメッセージを表示する
                validFlagFound = true;
                return spawnprotectionHelp(player, prefix, configuration.modules.spawnprotection.enabled, configuration.customcommands.spawnprotection);
            case "-s":
            case "--status":
                // SpawnProtectionモジュールの現在のステータスを表示する。
                validFlagFound = true;
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Spawn Protection module is currently ${configuration.modules.spawnprotection.enabled ? "§aBoolean" : "§4無効"}§f.`);
                break;
            case "-e":
            case "--enable":
                // SpawnProtectionモジュールをBooleanにする
                validFlagFound = true;
                updates = true;
                if (!configuration.modules.spawnprotection.enabled) {
                    const vec3 = configuration.modules.spawnprotection.vector3;
                    const allZero = vec3.x === 0 && vec3.y === 0 && vec3.z === 0;
                    const rad = configuration.modules.spawnprotection.radius;
                    if (allZero && rad === 0) {
                        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f最初にスポーンガードの中心と半径を設定してください！`);
                    }
                    configuration.modules.spawnprotection.enabled = true;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    SpawnProtection();
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fスポーン保護モジュールがすでにBooleanになっている。`);
                }
                break;
            case "-d":
            case "--disable":
                // SpawnProtectionモジュールを無効にする
                validFlagFound = true;
                if (configuration.modules.spawnprotection.enabled) {
                    configuration.modules.spawnprotection.enabled = false;
                    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f は無効 §4Spawn Protection§f!`);
                } else {
                    sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fスポーン・プロテクション・モジュールは既に無効になっている。`);
                }
                break;
            case "-c":
            case "--center": {
                // スポーン保護センター
                validFlagFound = true;
                updates = true;
                const shiftArray = args.slice(i + 1);
                if (shiftArray && shiftArray.length < 3) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f無効な引数が与えられました．x y z を含めてください、例えば: 10 64 -10.`);
                }

                let [x, y, z] = shiftArray.slice(0, 3).map((arg) => (arg === "~" ? arg : parseFloat(arg)));

                if ((x !== "~" && isNaN(x as number)) || (y !== "~" && isNaN(y as number)) || (z !== "~" && isNaN(z as number))) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f無効な引数が与えられました。x, y, z がBooleanな数であることを確認してください。`);
                }

                if (x === "~") {
                    x = Math.ceil(player.location.x);
                }
                if (y === "~") {
                    y = Math.ceil(player.location.y);
                }
                if (z === "~") {
                    z = Math.ceil(player.location.z);
                }

                const vector3 = { x: x, y: y, z: z };
                configuration.modules.spawnprotection.vector3 = vector3;
                dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                break;
            }
            case "-r":
            case "--radius": {
                // スポーン保護センター
                validFlagFound = true;
                updates = true;
                const shiftArray = args.slice(i + 1);
                if (shiftArray && shiftArray.length < 1) {
                    return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 無効な引数が与えられました．半径を指定してください（例：90.`);
                }
                const radius = parseFloat(shiftArray[0]);

                configuration.modules.spawnprotection.radius = Math.abs(radius as number);
                dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
                break;
            }
        }
    }

    if (!validFlagFound) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Invalid command. Use ${prefix}spawnprotection --help for command usage.`);
    }

    if (updates) {
        const messageAction = configuration.modules.spawnprotection.enabled ? "has updated" : "以下の機能が有効です=>";
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f ${messageAction} §6Spawn Protection§f!`);
    }
}
