import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiHOTBAR } from "../../../modules/uiHotbar";
import ConfigInterface from "../../../../interfaces/Config";

export function hotbarHandler(player: Player) {
    const moduleshotbarui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const hotbarBoolean = configuration.modules.hotbar.enabled;
    const CurrentHotbarConfig = configuration.modules.hotbar.message;
    moduleshotbarui.title("§4 Hotbarメニュー§4");
    moduleshotbarui.textField("ホットバーのメッセージ", "", CurrentHotbarConfig);
    moduleshotbarui.toggle("Enable Hotbar - ホットバーメッセージを表示します：", hotbarBoolean);
    moduleshotbarui.toggle("config.jsに保存されているメッセージに戻す：", false);
    moduleshotbarui
        .show(player)
        .then((hotbarResult) => {
            uiHOTBAR(hotbarResult, player);
        })
        .catch((error) => {
            console.error("パラドックスの未処理拒否：", error);
            // スタックトレース情報の抽出
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("エラーの原因", sourceInfo[0]);
                }
            }
        });
}
