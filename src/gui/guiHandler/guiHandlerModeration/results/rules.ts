import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiRULES } from "../../../moderation/uiRules";
import { Player } from "@minecraft/server";
import ConfigInterface from "../../../../interfaces/Config";

export function rulesHandler(player: Player) {
    //ルール表示
    const rulesui = new ModalFormData();
    rulesui.title("§4Configure Rulesメニュー§4");
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const showrulesBoolean = configuration.modules.showrules.enabled;
    const KickOnDeclineBoolean = configuration.modules.showrules.kick;
    rulesui.toggle("ルールをBooleanにする：", showrulesBoolean);
    rulesui.toggle("キック・オン・デクライン", KickOnDeclineBoolean);
    rulesui
        .show(player)
        .then((rulesResult) => {
            // 制限のため、ゲーム内でルールを編集することはできません。
            uiRULES(rulesResult, player);
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
