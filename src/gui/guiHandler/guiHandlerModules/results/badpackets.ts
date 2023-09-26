import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiBADPACKETS } from "../../../modules/uiBadpackets";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";

export function badPacketsHandler(player: Player) {
    const modulesbadpacketsui = new ModalFormData();
    const badPackets1Boolean = dynamicPropertyRegistry.get("badpackets1_b") as boolean;
    const badPackets2Boolean = dynamicPropertyRegistry.get("badpackets2_b") as boolean;
    modulesbadpacketsui.title("§4メニュー：Badpackets§4");
    modulesbadpacketsui.toggle("各ブロードキャストでメッセージの長さをチェックします。", badPackets1Boolean);
    modulesbadpacketsui.toggle("プレイヤーごとに無効な選択されたスロットをチェックします。", badPackets2Boolean);
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
