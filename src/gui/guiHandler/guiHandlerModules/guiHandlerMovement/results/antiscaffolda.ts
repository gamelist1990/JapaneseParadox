import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISCAFFOLD } from "../../../../modules/uiAntiScaffold";
import ConfigInterface from "../../../../../interfaces/Config";

export function antiScaffoldAHandler(player: Player) {
    //抗足場
    const modulesantiscaffoldui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiScaffoldABoolean = configuration.modules.antiscaffoldA.enabled;
    modulesantiscaffoldui.title("§4Anti Scaffoldメニュー§4");
    modulesantiscaffoldui.toggle("アンチ足場 - 選手が違法な足場を組んでいないかチェックします：", antiScaffoldABoolean);
    modulesantiscaffoldui
        .show(player)
        .then((antiscaffoldResult) => {
            uiANTISCAFFOLD(antiscaffoldResult, player);
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
