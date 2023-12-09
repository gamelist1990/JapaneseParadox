import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiGAMEMODES } from "../../../modules/uiGamemodes";
import ConfigInterface from "../../../../interfaces/Config";

export function gamemodesHandler(player: Player) {
    //ゲームモードUI
    const gamemodesui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const adventureGMBoolean = configuration.modules.adventureGM.enabled;
    const creativeGMBoolean = configuration.modules.creativeGM.enabled;
    const survivalGMBoolean = configuration.modules.survivalGM.enabled;
    gamemodesui.title("§4Gamemodeメニュー§4");
    gamemodesui.toggle("アドベンチャーを無効にする：", adventureGMBoolean);
    gamemodesui.toggle("クリエイティブを無効にする：", creativeGMBoolean);
    gamemodesui.toggle("サバイバルを無効にする：", survivalGMBoolean);
    gamemodesui
        .show(player)
        .then((gamemodeResult) => {
            uiGAMEMODES(gamemodeResult, player);
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
