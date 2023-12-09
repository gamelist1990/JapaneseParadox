import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiWORLDBORDER } from "../../../modules/uiWorldborder";
import ConfigInterface from "../../../../interfaces/Config";

export function worldBorderHandler(player: Player) {
    const modulesworldborderui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const overWorldBorderBoolean = configuration.modules.worldBorder.enabled;
    const overworldBorderNumber = configuration.modules.worldBorder.overworld;
    const netherworldBorderNumber = configuration.modules.worldBorder.nether;
    const endworldBorderNumber = configuration.modules.worldBorder.end;
    modulesworldborderui.title("§4World Borderメニュー§4");
    modulesworldborderui.textField("オーバー・ワールド・ボーダー - ブロック単位の価値：", "1000", String(overworldBorderNumber));
    modulesworldborderui.textField("ネザー・ワールド・ボーダー - ブロック内の値。無効にする必要がある場合は0に設定する：", "0", String(netherworldBorderNumber));
    modulesworldborderui.textField("End World Border - ブロック単位の値。無効にする必要がある場合は0を設定する：", "0", String(endworldBorderNumber));
    modulesworldborderui.toggle("ワールドボーダーをBooleanにする", overWorldBorderBoolean);
    modulesworldborderui
        .show(player)
        .then((spamResult) => {
            uiWORLDBORDER(spamResult, player);
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
