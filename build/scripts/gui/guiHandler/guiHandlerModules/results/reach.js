import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiREACH } from "../../../modules/uiReach";
export function reachHandler(player) {
    const modulesreachui = new ModalFormData();
    const reachABoolean = dynamicPropertyRegistry.get("reacha_b");
    const reachBBoolean = dynamicPropertyRegistry.get("reachb_b");
    modulesreachui.title("§4メニュー：Reach§4");
    modulesreachui.toggle("遠くにブロックを設置しれいないかを検知:", reachABoolean);
    modulesreachui.toggle("プレイヤーに対して攻撃範囲が伸びてないかを検知", reachBBoolean);
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
