import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiRULES } from "../../../moderation/uiRules";
import { Player, Vector3 } from "@minecraft/server";

export function rulesHandler(player: Player) {
    //show rules ui
    const rulesui = new ModalFormData();
    rulesui.title("§4ルールに関する設定§4");
    const showrulesBoolean = dynamicPropertyRegistry.get("showrules_b") as boolean;
    const KickOnDeclineBoolean = dynamicPropertyRegistry.get("kickondecline_b") as boolean;
    rulesui.toggle("ルールを有効又は無効:", showrulesBoolean);
    rulesui.toggle("ルールに同意しないとキック:", KickOnDeclineBoolean);
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
