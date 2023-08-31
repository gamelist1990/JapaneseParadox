import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiREACH } from "../../../modules/uiReach";
export function reachHandler(player) {
    const modulesreachui = new ModalFormData();
    const reachABoolean = dynamicPropertyRegistry.get("reacha_b");
    const reachBBoolean = dynamicPropertyRegistry.get("reachb_b");
    modulesreachui.title("§4リーチを検知§4");
                        modulesreachui.toggle("Reach A - プレーヤーが手の届かないところにブロックを置いていないかチェックする：", reachABoolean);
                        modulesreachui.toggle("Reach C - 手の届かないところにユーザーが攻撃していないかチェックする:", reachBBoolean);
    modulesreachui
        .show(player)
        .then((reachResult) => {
        uiREACH(reachResult, player);
    })
        .catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}
