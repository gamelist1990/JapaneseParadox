import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiNAMESPOOFING } from "../../../modules/uiNameSpoofing";
export function nameSpoofHandler(player) {
    //Namespoofing
    const modulesnamespoofingui = new ModalFormData();
    const nameSpoofABoolean = dynamicPropertyRegistry.get("namespoofa_b");
    const nameSpoofBBoolean = dynamicPropertyRegistry.get("namespoofb_b");
    modulesnamespoofingui.title("§4メニュー：Name spoofing§4");
    modulesnamespoofingui.toggle("ユーザー名が文字数制限を超えていないかチェックする。:", nameSpoofABoolean);
    modulesnamespoofingui.toggle("ASCII以外の文字を含むユーザー名をチェックする。:", nameSpoofBBoolean);
    modulesnamespoofingui
        .show(player)
        .then((namespoofingResult) => {
        uiNAMESPOOFING(namespoofingResult, player);
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
