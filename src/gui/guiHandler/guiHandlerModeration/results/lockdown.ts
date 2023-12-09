import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiLOCKDOWN } from "../../../moderation/uiLockdown";
import ConfigInterface from "../../../../interfaces/Config";

export function lockdownHandler(player: Player) {
    //ロックダウン ui
    const lockdownui = new ModalFormData();
    // ダイナミック・プロパティ・ブール値の取得
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const lockdownBoolean = configuration.modules.lockdown.enabled;
    lockdownui.title("§4Lockdownメニュー§4");
    lockdownui.textField("理由", "世界で最も可能性のあるハッカー");
    lockdownui.toggle("ロックダウンをBooleanまたは無効にする：", lockdownBoolean);
    lockdownui
        .show(player)
        .then((lockdownResult) => {
            uiLOCKDOWN(lockdownResult, player);
        })
        .catch((error) => {
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
