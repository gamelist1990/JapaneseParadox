import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiWORLDBORDER } from "../../../modules/uiWorldborder";
export function worldBorderHandler(player) {
    const modulesworldborderui = new ModalFormData();
    const overWorldBorderBoolean = dynamicPropertyRegistry.get("worldborder_b");
    const overworldBorderNumber = dynamicPropertyRegistry.get("worldborder_n");
    const netherworldBorderNumber = dynamicPropertyRegistry.get("worldborder_nether_n");
    const endworldBorderNumber = dynamicPropertyRegistry.get("worldborder_end_n");
    modulesworldborderui.title("§4ワールドボーダー§4");
                        modulesworldborderui.textField("現世 World Border - ブロック単位の値：", "1000", String(overworldBorderNumber));
                        modulesworldborderui.textField("Nether World Border - ブロック単位の値。無効にする必要がある場合は0に設定:", "0", String(netherworldBorderNumber));
                        modulesworldborderui.textField("End World Border - ブロック単位の値。無効にする必要がある場合は0に設定:", "0", String(endworldBorderNumber));
                        modulesworldborderui.toggle("有効または無効にするか？:", overWorldBorderBoolean);
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
