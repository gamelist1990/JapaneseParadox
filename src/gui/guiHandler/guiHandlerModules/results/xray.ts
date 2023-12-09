import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiXRAY } from "../../../modules/uiXray";
import ConfigInterface from "../../../../interfaces/Config";

export function xrayHandler(player: Player) {
    const modulesxtrayui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    modulesxtrayui.title("§4Xrayメニュー§4");
    const xrayBoolean = configuration.modules.xrayA.enabled;
    modulesxtrayui.toggle("Xray - プレーヤーが特定の鉱石を採掘した時と場所をスタッフに通知する：", xrayBoolean);
    modulesxtrayui
        .show(player)
        .then((xrayResult) => {
            uiXRAY(xrayResult, player);
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
