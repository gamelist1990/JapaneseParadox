import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiRULES } from "../../../moderation/uiRules";
export function rulesHandler(player) {
    //show rules ui
    const rulesui = new ModalFormData();
    rulesui.title("§4ルール§4");
                        const showrulesBoolean = dynamicPropertyRegistry.get("showrules_b");
                        const KickOnDeclineBoolean = dynamicPropertyRegistry.get("kickondecline_b");
                        rulesui.toggle("ルールを有効化", showrulesBoolean);
                        rulesui.toggle("拒否した場合キック", KickOnDeclineBoolean);
    rulesui
        .show(player)
        .then((rulesResult) => {
        // due to limitations we can't edit the rules in game.
        uiRULES(rulesResult, player);
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
