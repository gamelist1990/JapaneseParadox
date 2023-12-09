import { Player, world } from "@minecraft/server";
import { ActionFormResponse, ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";
import { WorldExtended } from "../../classes/WorldExtended/World.js";
import ConfigInterface from "../../interfaces/Config.js";

//Visual1インパクトが提供する機能
export function uiOP(opResult: ModalFormResponse | ActionFormResponse, salt: string | number | boolean, hash: string | number | boolean, player: Player, onlineList?: string[]) {
    if (!opResult || opResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }

    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;

    if (!hash || !salt || (hash !== (world as WorldExtended).hashWithSalt(salt as string, configuration.encryption.password || player.id) && (world as WorldExtended).isValidUUID(salt as string))) {
        if (!configuration.encryption.password) {
            if (!player.isOp()) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fこのコマンドを使うにはオペレータである必要がある。`);
                return paradoxui(player);
            }
        }
    }

    if ("formValues" in opResult) {
        // これはModalFormResponseです。

        const [value] = opResult.formValues;

        // 要求された選手を見つけよう
        let targetPlayer: Player;

        if (onlineList.length > 0) {
            const players = world.getPlayers();
            for (const pl of players) {
                if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
                    targetPlayer = pl;
                    break;
                }
            }
        } else {
            targetPlayer = player;
            if (configuration.encryption.password !== value) {
                // パスワードの誤り
                return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fパスワードが間違っています。このコマンドを使用するには Operator である必要があります。`);
            }
        }

        if (targetPlayer) {
            const targetHash = targetPlayer.getDynamicProperty("hash");

            if (targetHash === undefined) {
                const targetSalt = (world as WorldExtended).generateRandomUUID();
                targetPlayer.setDynamicProperty("salt", targetSalt);

                // オペレーターのIDまたは暗号化パスワードのいずれかをキーとして使用する。
                const targetKey = configuration.encryption.password ? configuration.encryption.password : targetPlayer.id;

                // ハッシュを生成する
                const newHash = (world as WorldExtended).hashWithSalt(targetSalt, targetKey);

                targetPlayer.setDynamicProperty("hash", newHash);

                dynamicPropertyRegistry.setProperty(targetPlayer, targetPlayer.id, targetPlayer.name);

                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f Paradox操作を§7${targetPlayer.name}§fに付与しました。`);
                sendMsgToPlayer(targetPlayer, `§f§4[§6Paradox§4]§f あなたは今、操作している！`);
                sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${targetPlayer.name}§f は Paradox-Opped になりました。`);
                targetPlayer.addTag("paradoxOpped");
                return paradoxui(player);
            } else {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f§7${targetPlayer.name}§f は既にParadoxOPである。`);
                return paradoxui(player);
            }
        } else {
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fプレーヤーが見つかりませんでした§7${targetPlayer.name}§f.`);
            return paradoxui(player);
        }
    } else if ("selection" in opResult) {
        // これはActionFormResponseである。
        if (opResult.selection === 0) {
            // 選手が自分のパスワードを変更したい
            const targetSalt = (world as WorldExtended).generateRandomUUID();
            const newHash = (world as WorldExtended).hashWithSalt(targetSalt, player.id);

            player.setDynamicProperty("hash", newHash);
            player.setDynamicProperty("salt", targetSalt);
            player.addTag("paradoxOpped");

            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたは今、Paradoxに縛られている！`);

            dynamicPropertyRegistry.setProperty(player, player.id, player.name);

            return paradoxui(player);
        }
        return paradoxui(player);
    } else {
        return paradoxui(player);
    }
}
