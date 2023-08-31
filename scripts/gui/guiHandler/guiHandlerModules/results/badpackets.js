import { ModalFormData } from "@minecraft/server-ui";
import { uiBADPACKETS } from "../../../modules/uiBadpackets";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
export function badPacketsHandler(player) {
    const modulesbadpacketsui = new ModalFormData();
    const badPackets1Boolean = dynamicPropertyRegistry.get("badpackets1_b");
    const badPackets2Boolean = dynamicPropertyRegistry.get("badpackets2_b");
    modulesbadpacketsui.title("§4Badpacketsを検知します§4");
                        modulesbadpacketsui.toggle("Badpackets1　- 各ブロードキャストでメッセージの長さをチェック:", badPackets1Boolean);
                        modulesbadpacketsui.toggle("Badpackets2　- プレーヤーが選択したスロットが無効かどうかをチェックする：", badPackets2Boolean);
    modulesbadpacketsui
        .show(player)
        .then((badpacketsResult) => {
        uiBADPACKETS(badpacketsResult, player);
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
