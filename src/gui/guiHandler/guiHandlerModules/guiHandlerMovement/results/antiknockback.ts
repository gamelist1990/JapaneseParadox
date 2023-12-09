import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIKNOCKBACK } from "../../../../modules/uiAntiKnockback";
import ConfigInterface from "../../../../../interfaces/Config";

export function antiKnockBackHandler(player: Player) {
    //アンチノックバックUI
    const modulesantiknockbackui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antikbBoolean = configuration.modules.antikbA.enabled;
    modulesantiknockbackui.title("§4Anti KnockBackメニュー§4");
    modulesantiknockbackui.toggle("アンチノックバック - すべてのプレイヤーにアンチノックバックを：", antikbBoolean);
    modulesantiknockbackui
        .show(player)
        .then((antikbResult) => {
            uiANTIKNOCKBACK(antikbResult, player);
        })
        .catch((error) => {
            console.error("パラドックスの未処理拒否：", error);
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
