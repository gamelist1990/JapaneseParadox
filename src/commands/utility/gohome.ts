import { world, Player, ChatSendAfterEvent } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsgToPlayer, setTimer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

const cooldownTimer = new WeakMap();

function dhms(ms: number) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const daysms = ms % (24 * 60 * 60 * 1000);
    const hours = Math.floor(daysms / (60 * 60 * 1000));
    const hoursms = ms % (60 * 60 * 1000);
    const minutes = Math.floor(hoursms / (60 * 1000));
    const minutesms = ms % (60 * 1000);
    const sec = Math.floor(minutesms / 1000);
    if (days !== 0) {
        return days + " 日 : " + hours + " 時間 : " + minutes + " 分 : " + sec + " 秒";
    }
    if (hours !== 0) {
        return hours + " 時間 : " + minutes + " 分 : " + sec + " 秒";
    }
    if (minutes !== 0) {
        return minutes + " 分 : " + sec + " 秒";
    }
    return sec + " 秒";
}

function goHomeHelp(player: Player, prefix: string, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: gohome`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6使用§4]§f: gohome [オプション］`,
        `§4[§6オプション§4]§f: 名前、ヘルプ`,
        `§4[§6説明§4]§f：指定した保存場所に帰る。`,
        `§4[§6例§4]§f：`,
        `    ${prefix}gohome barn`,
        `        §4-§6「納屋」ホームへの帰還§f`,
        `    ${prefix}gohome help`,
        `        §4- §6コマンドを表示するヘルプ§f`,
    ]);
}

/**
 * @name gohome
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function gohome(message: ChatSendAfterEvent, args: string[]) {
    handleGoHome(message, args).catch((error) => {
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

async function handleGoHome(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを検証する
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? ./commands/utility/gohome.js:52)");
    }

    const player = message.sender;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // キャッシュ
    const length = args.length;

    // 反論はあるか
    if (!length) {
        return goHomeHelp(player, prefix, configuration.customcommands.gohome);
    }

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.gohome) {
        return goHomeHelp(player, prefix, configuration.customcommands.gohome);
    }

    // スペースを許可しない
    if (length > 1) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f名前にスペースを入れないでください！`);
    }

    // 安全のために座標をハッシュ化する
    const salt = world.getDynamicProperty("crypt");

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    let homex: number;
    let homey: number;
    let homez: number;
    let dimension: string;
    let coordinatesArray: string[];
    const tags = player.getTags();
    const tagsLength = tags.length;
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            // それを検証するためにデコードする
            tags[i] = (world as WorldExtended).decryptString(tags[i], salt as string);
        }
        if (tags[i].startsWith(args[0].toString() + " X", 13)) {
            // 文字列を配列に分割する
            coordinatesArray = tags[i].split(" ");
            break;
        }
    }

    if (!coordinatesArray) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f '§7${args[0]}§f' は見つかりません`);
    }

    const coordArrayLength = coordinatesArray.length;
    for (let i = 0; i < coordArrayLength; i++) {
        // 配列から位置を取得する
        if (coordinatesArray[i].includes("X:")) {
            homex = parseInt(coordinatesArray[i].replace("X:", ""));
        }
        if (coordinatesArray[i].includes("Y:")) {
            homey = parseInt(coordinatesArray[i].replace("Y:", ""));
        }
        if (coordinatesArray[i].includes("Z:")) {
            homez = parseInt(coordinatesArray[i].replace("Z:", ""));
        }
        if (coordinatesArray[i].includes("Dimension:")) {
            dimension = coordinatesArray[i].replace("Dimension:", "");
        }
    }

    if (!homex || !homey || !homez || !dimension) {
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '§7${args[0]}§f' 存在しないよ！もう一回確認してみて`);
    } else {
        let cooldownCalc: number;
        let activeTimer: string;
        // 元の時間をミリ秒単位で取得
        const cooldownVerify = cooldownTimer.get(player);
        // コンフィグ設定をミリ秒に変換し、カウントダウンが正確であることを確認できるようにする。
        const msSettings = configuration.modules.goHome.days * 24 * 60 * 60 * 1000 + configuration.modules.goHome.hours * 60 * 60 * 1000 + configuration.modules.goHome.minutes * 60 * 1000 + configuration.modules.goHome.seconds * 1000;
        if (cooldownVerify !== undefined) {
            // 新しいタイムと元のタイムの差をミリ秒単位で判断する
            const bigBrain = new Date().getTime() - cooldownVerify;
            // 設定のカウントダウンからリアルタイムクロックを引いて差を求める
            cooldownCalc = msSettings - bigBrain;
            // 差分をクロック形式に変換 D：H：M：S
            activeTimer = dhms(cooldownCalc);
        } else {
            // 初めて実行されるため、デフォルトではミリ秒単位で設定されます。
            cooldownCalc = msSettings;
        }
        // タイマーが存在しないか、期限が切れている場合は、テレポートの許可を与え、カウントダウンを設定する。
        if (cooldownCalc === msSettings || cooldownCalc <= 0 || uniqueId === player.name) {
            // このタイマーは猶予期間である
            setTimer(player.id);
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f tpしました！`);
            player.teleport(
                { x: homex, y: homey, z: homez },
                {
                    dimension: world.getDimension(dimension),
                    rotation: { x: 0, y: 0 },
                    facingLocation: { x: 0, y: 0, z: 0 },
                    checkForBlocks: true,
                    keepVelocity: false,
                }
            );
            // 古いキーと値を削除する
            cooldownTimer.delete(player);
            // ミリ秒単位の現在時刻を持つ新しいキーと値を作成する。
            cooldownTimer.set(player, new Date().getTime());
        } else {
            // 高速テレポート
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 速すぎる！7${activeTimer}§fまで待ってからtpしてください。`);
        }
    }
}
