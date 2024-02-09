import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

function lockdownHelp(player: Player, prefix: string, lockdownBoolean: boolean, setting: boolean) {
    let commandStatus: string;
    if (!setting) {
        commandStatus = "§6[§4無効§6]§f";
    } else {
        commandStatus = "§6[§a有効§6]§f。";
    }
    let moduleStatus: string;
    if (lockdownBoolean === false) {
        moduleStatus = "§6[§4無効§6]§f";
    } else {
        moduleStatus = "§6[§a有効§6]§f。";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6コマンド§4]§f: lockdown`,
        `§4[§6ステータス§4]§f: ${commandStatus}.`,
        `§4[§6モジュール§4]§f: ${moduleStatus}.`,
        `§4[§6使用§4]§f：ロックダウン [オプション］`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6解説§4]§f：メンテナンスのためにスタッフを除くプレイヤーをサーバーから追い出す。`,
        `§4[§6例§4]§f：`,
        `    プレフィックス}ロックダウン`,
        `        §メンテナンスのためのサーバロックダウンの開始§f`,
        `    ${prefix}lockdown help`,
        `        §4- §6Show command help§f`,
    ]);
}

/**
 * @name lockdown
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function lockdown(message: ChatSendAfterEvent, args: string[]) {
    handleLockdown(message, args).catch((error) => {
        console.error("Paradoxの未処理拒否：", error);
        // スタックトレース情報の抽出
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("エラーの原因", sourceInfo[0]);
            }
        }
    });
}

async function handleLockdown(message: ChatSendAfterEvent, args: string[]) {
    // 必要なパラメータが定義されていることを確認する
    if (!message) {
        return console.warn(`新しい日付()}。|` + "エラー: ${message} が定義されていません。渡し忘れですか？(./commands/moderation/lockdown.js:37)");
    }

    const player = message.sender;

    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(
            player,
            `§f§4[§6Paradox§4]§f このコマンドを使用するには、管理者にしか使えません
`
        );
    }

    // ダイナミック・プロパティ・ブール値の取得
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    // カスタム接頭辞のチェック
    const prefix = getPrefix(player);

    // 助けを求められたか
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !configuration.customcommands.lockdown) {
        return lockdownHelp(player, prefix, configuration.modules.lockdown.enabled, configuration.customcommands.lockdown);
    }

    // すでにロックされている場合は、サーバーのロックを解除する。
    if (configuration.modules.lockdown.enabled) {
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4] サーバーのロックダウンを停止しました`);
        configuration.modules.lockdown.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        return;
    }

    // ロックするデフォルトの理由
    const reason = "Under Maintenance! Sorry for the inconvenience.";

    // ロックする
    const players = world.getPlayers();
    for (const pl of players) {
        // ハッシュ/ソルトのチェックとパスワードの検証
        const hash = pl.getDynamicProperty("hash");
        const salt = pl.getDynamicProperty("salt");

        // オペレーターのIDまたは暗号化パスワードのいずれかをキーとして使用する。
        const key = configuration.encryption.password ? configuration.encryption.password : pl.id;

        // ハッシュを生成する
        const encode = (world as WorldExtended).hashWithSalt(salt as string, key);
        if (encode && hash !== undefined && encode === hash) {
            continue;
        }

        // サーバーからプレーヤーをキックする
        pl.runCommandAsync(`kick ${pl.name} §f\n\n${reason}`).catch(() => {
            // サーバーからプレイヤーをデスポーンさせる
            pl.triggerEvent("paradox:kick");
        });
    }
    // 閉鎖
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§fサーバーはロックダウン中です！`);
    configuration.modules.lockdown.enabled = true;
    dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", true);
    return;
}
