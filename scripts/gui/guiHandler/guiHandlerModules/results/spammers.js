import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiSPAMMER } from "../../../modules/uiSpammer";
export function spammersHandler(player) {
    const modulesspamui = new ModalFormData();
    const spammerABoolean = dynamicPropertyRegistry.get("spammera_b");
    const spammerBBoolean = dynamicPropertyRegistry.get("spammerb_b");
    const spammerCBoolean = dynamicPropertyRegistry.get("spammerc_b");
    modulesspamui.title("§4スパム設定§4");
                        modulesspamui.toggle("Spammer A - 歩きながらチャットしているか検知する:", spammerABoolean);
                        modulesspamui.toggle("Spammer B - 泳ぎながらチャットしているか検知する:", spammerBBoolean);
                        modulesspamui.toggle("Spammer C - アイテムを使用しながら検知する:", spammerCBoolean);
    modulesspamui
        .show(player)
        .then((spamResult) => {
        uiSPAMMER(spamResult, player);
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
