import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiLAGCLEAR } from "../../../modules/uiLagClear";
import ConfigInterface from "../../../../interfaces/Config";

export function lagClearHandler(player: Player) {
    //ラグクリア
    const moduleslaglearui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const clearLagBoolean = configuration.modules.clearLag.enabled;
    moduleslaglearui.title("§4 Clear Lagメニュー§4");
    moduleslaglearui.toggle("Clear Lag - タイマーでアイテムやエンティティをクリアする：", clearLagBoolean);
    moduleslaglearui
        .show(player)
        .then((lagclearResult) => {
            uiLAGCLEAR(lagclearResult, player);
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
