import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiNAMESPOOFING } from "../../../modules/uiNameSpoofing";
import ConfigInterface from "../../../../interfaces/Config";

export function nameSpoofHandler(player: Player) {
    //名前偽装
    const modulesnamespoofingui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const nameSpoofABoolean = configuration.modules.namespoofA.enabled;
    const nameSpoofBBoolean = configuration.modules.namespoofB.enabled;
    modulesnamespoofingui.title("§4Name spoofingメニュー§4");
    modulesnamespoofingui.toggle("名前なりすましA - 選手の名前が文字数制限を超えていないかチェックする：", nameSpoofABoolean);
    modulesnamespoofingui.toggle("名前なりすましB - ASCII以外の文字を含む選手名をチェックする：", nameSpoofBBoolean);
    modulesnamespoofingui
        .show(player)
        .then((namespoofingResult) => {
            uiNAMESPOOFING(namespoofingResult, player);
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
