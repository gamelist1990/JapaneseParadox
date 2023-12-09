import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiENCHANTEDARMOR } from "../../../modules/uiEnchantedArmor";
import { ScoreManager } from "../../../../classes/ScoreManager";

export function antiEnchantedArmorHandler(player: Player) {
    const modulesenchantedarmorui = new ModalFormData();
    const encharmorscore = ScoreManager.getScore("encharmor", player);
    let enchantedarmorBoolean: boolean;
    /**get the score value and then check to see if its already enable or already disabled
     * so we can then update the control boolean to disaply its current setting to the player
     * in the menu.
     */
    if (encharmorscore <= 0) {
        enchantedarmorBoolean = false;
    }
    if (encharmorscore >= 1) {
        enchantedarmorBoolean = true;
    }
    modulesenchantedarmorui.title("§4Enchanted Armorメニュー§4");
    modulesenchantedarmorui.toggle("Enchanted Armor - 全プレイヤーのためのアンチエンチャントアーマー：", enchantedarmorBoolean);
    modulesenchantedarmorui
        .show(player)
        .then((enchantedarmorResult) => {
            uiENCHANTEDARMOR(enchantedarmorResult, player);
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
