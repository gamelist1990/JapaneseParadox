import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiOPS } from "../../../modules/uiOnePlayerSleep";
import ConfigInterface from "../../../../interfaces/Config";

export function opsHandler(player: Player) {
    const modulesopsui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const opsBoolean = configuration.modules.ops.enabled;
    modulesopsui.title("§4 OPSメニュー§4");
    modulesopsui.toggle("One Player Sleep - プレイヤー1人が一晩中眠れる：", opsBoolean);
    modulesopsui
        .show(player)
        .then((opsResult) => {
            uiOPS(opsResult, player);
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
