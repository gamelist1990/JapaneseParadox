import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTINUKER } from "../../../modules/uiAntiNuker";
import ConfigInterface from "../../../../interfaces/Config";

export function antiNukerAHandler(player: Player) {
    const modulesantinukerui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiNukerABoolean = configuration.modules.antinukerA.enabled;
    modulesantinukerui.title("§4Anti Nukerメニュー§4");
    modulesantinukerui.toggle("Anti Nuker - プレイヤーにブロックの核攻撃がないかチェックする：", antiNukerABoolean);
    modulesantinukerui
        .show(player)
        .then((antinukerResult) => {
            uiANTINUKER(antinukerResult, player);
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
