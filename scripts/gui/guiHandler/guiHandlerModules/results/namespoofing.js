import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiNAMESPOOFING } from "../../../modules/uiNameSpoofing";
export function nameSpoofHandler(player) {
    //Namespoofing
    const modulesnamespoofingui = new ModalFormData();
    const nameSpoofABoolean = dynamicPropertyRegistry.get("namespoofa_b");
    const nameSpoofBBoolean = dynamicPropertyRegistry.get("namespoofb_b");
    modulesnamespoofingui.title("§4名前偽装§4");
                        modulesnamespoofingui.toggle("Name Spoofing A - ユーザー名が文字数の制限を超えていないかチェックする：", nameSpoofABoolean);
                        modulesnamespoofingui.toggle("Name Spoofing B - ASCII文字以外を含むユーザー名のチェック:", nameSpoofBBoolean);
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
