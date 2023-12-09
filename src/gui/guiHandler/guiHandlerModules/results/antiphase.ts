import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIPHASE } from "../../../modules/uiAntiPhase";
import ConfigInterface from "../../../../interfaces/Config";

export function antiPhaseAHandler(player: Player) {
    const modulesantiphaseui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiPhaseBoolean = configuration.modules.antiphaseA.enabled;
    modulesantiphaseui.title("§4 Anti Phaseメニュー§4");
    modulesantiphaseui.toggle("アンチフェイズ - プレイヤーのフェイズブロックをチェックする：", antiPhaseBoolean);
    modulesantiphaseui
        .show(player)
        .then((antiphaseResult) => {
            uiANTIPHASE(antiphaseResult, player);
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
