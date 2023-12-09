import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIKILLAURA } from "../../../modules/uiAntiKillaura";
import ConfigInterface from "../../../../interfaces/Config";

export function antiKillAuraHandler(player: Player) {
    const modulesantikillaura = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiKillAuraBoolean = configuration.modules.antiKillAura.enabled;
    modulesantikillaura.title("§4Anti KillAuraメニュー§4");
    modulesantikillaura.toggle("Anti KillAura - 90度の角度以外からの攻撃をチェックするかどうかを切り替えます：", antiKillAuraBoolean);
    modulesantikillaura
        .show(player)
        .then((antikillauraResult) => {
            uiANTIKILLAURA(antikillauraResult, player);
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
