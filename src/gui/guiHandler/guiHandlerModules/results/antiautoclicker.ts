import { Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIAUTOCLICKER } from "../../../modules/uiAntiAutoClicker";
import { ModalFormData } from "@minecraft/server-ui";
import ConfigInterface from "../../../../interfaces/Config";

export function antiAutoClickerHandler(player: Player) {
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const autoClickerBoolean = configuration.modules.autoclicker.enabled;
    const modulesantiautoclickerui = new ModalFormData();
    modulesantiautoclickerui.title("§4Anti AutoClickerメニュー§4");
    modulesantiautoclickerui.toggle("アンチオートクリッカー - 攻撃中にオートクリッカーを使っているプレイヤーをチェックする：", autoClickerBoolean);
    modulesantiautoclickerui
        .show(player)
        .then((antiautoclickerResult) => {
            uiANTIAUTOCLICKER(antiautoclickerResult, player);
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
