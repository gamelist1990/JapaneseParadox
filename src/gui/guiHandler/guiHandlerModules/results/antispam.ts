import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISPAM } from "../../../modules/uiAntiSpam";

export function antiSpamHandler(player: Player) {
    const modulesantispamui = new ModalFormData();
    const antiSpamBoolean = dynamicPropertyRegistry.get("antispam_b") as boolean;
    modulesantispamui.title("§4メニュー：Anti Spam§4");
    modulesantispamui.toggle("二秒以内に連続でチャットしていると少しまってねの通知がきます:", antiSpamBoolean);
    modulesantispamui
        .show(player)
        .then((antispamResult) => {
            uiANTISPAM(antispamResult, player);
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
