import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiSPAMMER } from "../../../modules/uiSpammer";

export function spammersHandler(player: Player) {
    const modulesspamui = new ModalFormData();
    const spammerABoolean = dynamicPropertyRegistry.get("spammera_b") as boolean;
    const spammerBBoolean = dynamicPropertyRegistry.get("spammerb_b") as boolean;
    const spammerCBoolean = dynamicPropertyRegistry.get("spammerc_b") as boolean;
    modulesspamui.title("§4メニュー：Spam Modules§4");
    modulesspamui.toggle("歩きながらチャットしているか？を検知:", spammerABoolean);
    modulesspamui.toggle("泳ぎながらチャットしているか？を検知:", spammerBBoolean);
    modulesspamui.toggle("アイテムを使用又は食べながらチャットしているか？を検知:", spammerCBoolean);
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
