import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiSPEED } from "../../../../modules/uiSpeed";
import ConfigInterface from "../../../../../interfaces/Config";

export function speedAHandler(player: Player) {
    //スピードA
    const modulesspeedui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const speedABoolean = configuration.modules.speedA.enabled;
    modulesspeedui.title("§4Speedメニュー§4");
    modulesspeedui.toggle("スピード - 選手のスピードハッキングをチェックする：", speedABoolean);
    modulesspeedui
        .show(player)
        .then((invalidsprintResult) => {
            uiSPEED(invalidsprintResult, player);
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
