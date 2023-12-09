import { Player } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import { queueUnban } from "../../commands/moderation/unban.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";
import { sendMsg, sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui.js";

export function uiUNBAN(unbanResult: ModalFormResponse, player: Player) {
    if (!unbanResult || unbanResult.canceled) {
        // キャンセルされたフォームまたは未定義の結果を処理する
        return;
    }
    const [textField, deleteUnban] = unbanResult.formValues;
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);

    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fプレイヤーをBANするにはParadoxOPする必要がある。`);
    }
    if (deleteUnban === true) {
        queueUnban.delete(textField as string);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${textField}§f が禁止解除キューから削除されました。`);
    }
    // 選手をキューに追加
    queueUnban.add(textField as string);
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f §7${textField}§f は禁止解除のキューに入れられています。`);
    return paradoxui(player);
}
