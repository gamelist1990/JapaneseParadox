import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import config from "../../../../data/config";
import { uiHOTBAR } from "../../../modules/uiHotbar";
export function hotbarHandler(player) {
    const moduleshotbarui = new ModalFormData();
    const hotbarBoolean = dynamicPropertyRegistry.get("hotbar_b");
    const CurrentHotbarConfig = config.modules.hotbar.message;
    moduleshotbarui.title("§4Hotbar機能§4");
                        moduleshotbarui.textField("ホットバーメッセージ！: ", "", CurrentHotbarConfig);
                        moduleshotbarui.toggle("Enable Hotbar - ホットバーメッセージを表示します：", hotbarBoolean);
                        moduleshotbarui.toggle("config.jsに保存されているメッセージに戻す：", false);
    moduleshotbarui
        .show(player)
        .then((hotbarResult) => {
        uiHOTBAR(hotbarResult, player);
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
