import { Player } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { ModalFormData } from "@minecraft/server-ui";
import { uiAUTOBAN } from "../../../moderation/uiAutoBan";
import ConfigInterface from "../../../../interfaces/Config";

export function autobanHandler(player: Player) {
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const autoBanBoolean = configuration.modules.autoBan.enabled;
    const autobanui = new ModalFormData();
    autobanui.title("§4Auto Banメニュー§4");
    autobanui.toggle("自動禁止をBooleanまたは無効にする：", autoBanBoolean);
    autobanui
        .show(player)
        .then((autobanResult) => {
            uiAUTOBAN(autobanResult, player);
        })
        .catch((error) => {
            console.error("Paradoxの未処理拒否：", error);
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
