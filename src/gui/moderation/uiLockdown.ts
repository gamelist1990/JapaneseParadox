import { Player, world } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

/**
 * Handles the result of a modal form used for initiating a server lockdown.
 *
 * @name uiLOCKDOWN
 * @param {ModalFormResponse} lockdownResult - The result of the lockdown modal form.
 * @param {Player} player - The player who triggered the lockdown modal form.
 */
export function uiLOCKDOWN(lockdownResult: ModalFormResponse, player: Player) {
    handleUILockdown(lockdownResult, player).catch((error) => {
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

async function handleUILockdown(lockdownResult: ModalFormResponse, player: Player) {
    if (!lockdownResult || lockdownResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [reason, LockdownToggle] = lockdownResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはParadox・オップされる必要がある。`);
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (LockdownToggle === true) {
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
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f Boolean＝＞ §6Lockdown§f!`);
    }
    //無効
    if (LockdownToggle === false) {
        configuration.modules.lockdown.enabled = false;
        dynamicPropertyRegistry.setProperty(undefined, "paradoxConfig", configuration);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${player.name}§f 無効＝＞ §4Lockdown§f!`);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§fサーバはもはやロックダウンされていません！`);
    }
    return paradoxui;
}
