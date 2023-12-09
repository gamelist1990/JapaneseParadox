import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISHULKER } from "../../../modules/uiAntiShulker";
import ConfigInterface from "../../../../interfaces/Config";

export function antiShulkerHandler(player: Player) {
    const modulesantishulkerui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiShulkerBoolean = configuration.modules.antishulker.enabled;
    modulesantishulkerui.title("§4 Anti Shulkerメニュー§4");
    modulesantishulkerui.toggle("Anti Shulker - 世界中のシュルカーボックスを許可または拒否します：", antiShulkerBoolean);
    modulesantishulkerui
        .show(player)
        .then((antishulkerResult) => {
            uiANTISHULKER(antishulkerResult, player);
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
