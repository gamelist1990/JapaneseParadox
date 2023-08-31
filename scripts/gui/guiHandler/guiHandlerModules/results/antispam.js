import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISPAM } from "../../../modules/uiAntiSpam";
export function antiSpamHandler(player) {
    const modulesantispamui = new ModalFormData();
    const antiSpamBoolean = dynamicPropertyRegistry.get("antispam_b");
    modulesantispamui.title("§4アンチスパム§4");
                        modulesantispamui.toggle("2秒内に連続で文字を入力しれると待ってねってお知らせ来ます", antiSpamBoolean);
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
