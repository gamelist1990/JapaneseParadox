import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiXRAY } from "../../../modules/uiXray";
export function xrayHandler(player) {
    const modulesxtrayui = new ModalFormData();
    modulesxtrayui.title("§4メニュー：Xray§4");
    const xrayBoolean = dynamicPropertyRegistry.get("xraya_b");
    modulesxtrayui.toggle("ユーザーが掘った鉱石の場所が分かります", xrayBoolean);
    modulesxtrayui
        .show(player)
        .then((xrayResult) => {
        uiXRAY(xrayResult, player);
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
