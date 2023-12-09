import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiANTISPAM } from "../../../modules/uiAntiSpam";
import ConfigInterface from "../../../../interfaces/Config";

export function antiSpamHandler(player: Player) {
    const modulesantispamui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const antiSpamBoolean = configuration.modules.antispam.enabled;
    modulesantispamui.title("§4 Anti Spamメニュー§4");
    modulesantispamui.toggle("アンチスパム - 2秒のクールダウンでチャットのスパムをチェックする：", antiSpamBoolean);
    modulesantispamui
        .show(player)
        .then((antispamResult) => {
            uiANTISPAM(antispamResult, player);
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
