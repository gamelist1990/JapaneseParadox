import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiINVALIDSPRINT } from "../../../../modules/uiInvalidSprint";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import ConfigInterface from "../../../../../interfaces/Config";

export function invalidSprintHandler(player: Player) {
    //無効なスプリント
    const modulesinvalidsprintui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const invalidSprintABoolean = configuration.modules.invalidsprintA.enabled;
    modulesinvalidsprintui.title("§4Invalid Sprintメニュー§4");
    modulesinvalidsprintui.toggle("無効スプリント - 失明効果による不正なスプリントをチェックする：", invalidSprintABoolean);
    modulesinvalidsprintui
        .show(player)
        .then((invalidsprintResult) => {
            uiINVALIDSPRINT(invalidsprintResult, player);
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
