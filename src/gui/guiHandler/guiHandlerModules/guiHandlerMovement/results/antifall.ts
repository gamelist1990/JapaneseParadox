import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIFALL } from "../../../../modules/uiAntiFall";
import ConfigInterface from "../../../../../interfaces/Config";

export function antiFallHandler(player: Player) {
    //アンチフォール
    const modulesantifallui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antifallABoolean = configuration.modules.antifallA.enabled;
    modulesantifallui.title("§4Anti Fallメニュー§4");
    modulesantifallui.toggle("アンチフォール - サバイバル中に落下ダメージを受けないかチェックする：", antifallABoolean);
    modulesantifallui
        .show(player)
        .then((antifallResult) => {
            uiANTIFALL(antifallResult, player);
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
