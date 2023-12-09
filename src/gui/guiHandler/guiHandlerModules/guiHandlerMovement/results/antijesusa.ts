import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTIJESUS } from "../../../../modules/uiAntiJesus";
import ConfigInterface from "../../../../../interfaces/Config";

export function antiJesusAHandler(player: Player) {
    //ジーザスUI
    const modulesantijesusui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const jesusaBoolean = configuration.modules.jesusA.enabled;
    modulesantijesusui.title("§4Anti Jesusメニュー§4");
    modulesantijesusui.toggle("アンチ・ジーザス（Anti Jesus） - 水や溶岩の上を歩いたり、スプリントしたりする際のチェックを切り替える：", jesusaBoolean);
    modulesantijesusui
        .show(player)
        .then((antijesusResult) => {
            uiANTIJESUS(antijesusResult, player);
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
