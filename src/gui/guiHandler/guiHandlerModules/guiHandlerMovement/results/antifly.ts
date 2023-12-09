import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIFLY } from "../../../../modules/uiAntiFly";
import ConfigInterface from "../../../../../interfaces/Config";

export function antiFlyHandler(player: Player) {
    //アンチ・フライ
    const modulesantiflyui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const flyABoolean = configuration.modules.flyA.enabled;
    modulesantiflyui.title("§4Anti Flyメニュー§4");
    modulesantiflyui.toggle("アンチフライ - サバイバル中の違法飛行をチェックする：", flyABoolean);
    modulesantiflyui
        .show(player)
        .then((antiflyResult) => {
            uiANTIFLY(antiflyResult, player);
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
