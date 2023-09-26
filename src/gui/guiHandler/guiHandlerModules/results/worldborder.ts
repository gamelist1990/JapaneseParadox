import { Player, Vector3 } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiWORLDBORDER } from "../../../modules/uiWorldborder";

export function worldBorderHandler(player: Player) {
    const modulesworldborderui = new ModalFormData();
    const overWorldBorderBoolean = dynamicPropertyRegistry.get("worldborder_b") as boolean;
    const overworldBorderNumber = dynamicPropertyRegistry.get("worldborder_n") as number;
    const netherworldBorderNumber = dynamicPropertyRegistry.get("worldborder_nether_n") as number;
    const endworldBorderNumber = dynamicPropertyRegistry.get("worldborder_end_n") as number;
    modulesworldborderui.title("§4メニュー：World Border§4");
    modulesworldborderui.textField("現世でのワールドボーダー設定", "1000", String(overworldBorderNumber));
    modulesworldborderui.textField("ネザーでのワールドボーダー設定", "0", String(netherworldBorderNumber));
    modulesworldborderui.textField("エンドでのワールドボーダーの設定:", "0", String(endworldBorderNumber));
    modulesworldborderui.toggle("ワールドボーダーを有効無効を切り替える", overWorldBorderBoolean);
    modulesworldborderui
        .show(player)
        .then((spamResult) => {
            uiWORLDBORDER(spamResult, player);
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
