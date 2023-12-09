import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiSPAMMER } from "../../../modules/uiSpammer";
import ConfigInterface from "../../../../interfaces/Config";

export function spammersHandler(player: Player) {
    const modulesspamui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const spammerABoolean = configuration.modules.spammerA.enabled;
    const spammerBBoolean = configuration.modules.spammerB.enabled;
    const spammerCBoolean = configuration.modules.spammerC.enabled;
    modulesspamui.title("§4Spam Modulesメニュー§4");
    modulesspamui.toggle("Spammer A - 移動中に送信されたメッセージをチェックする：", spammerABoolean);
    modulesspamui.toggle("Spammer B - スイング中に送信されたメッセージをチェックする：", spammerBBoolean);
    modulesspamui.toggle("Spammer C - アイテム使用中に送信されたメッセージをチェックする：", spammerCBoolean);
    modulesspamui
        .show(player)
        .then((spamResult) => {
            uiSPAMMER(spamResult, player);
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
