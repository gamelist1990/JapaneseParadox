import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiREACH } from "../../../modules/uiReach";
import ConfigInterface from "../../../../interfaces/Config";

export function reachHandler(player: Player) {
    const modulesreachui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const reachABoolean = configuration.modules.reachA.enabled;
    const reachBBoolean = configuration.modules.reachB.enabled;
    modulesreachui.title("§4Reachメニュー§4");
    modulesreachui.toggle("リーチA - プレーヤーが手の届かないところにブロックを置いていないかチェックする：", reachABoolean);
    modulesreachui.toggle("リーチC - リーチを超えて攻撃している選手がいないかチェックする：", reachBBoolean);
    modulesreachui
        .show(player)
        .then((reachResult) => {
            uiREACH(reachResult, player);
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
