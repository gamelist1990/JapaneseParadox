import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiCOMMANDBLOCKS } from "../../../modules/uiCommandBlocks";
import { ScoreManager } from "../../../../classes/ScoreManager";

export function commandBlocksHandler(player: Player) {
    const modulescommandblocksui = new ModalFormData();
    const cmdsscore = ScoreManager.getScore("cmds", player);
    const commandblocksscore = ScoreManager.getScore("commandblocks", player);
    let removecmdblocksBoolean;
    Boolean;
    let cmdoBoolean: boolean;
    if (cmdsscore <= 0) {
        cmdoBoolean = false;
    }
    if (cmdsscore >= 1) {
        cmdoBoolean = true;
    }
    if (commandblocksscore <= 0) {
        removecmdblocksBoolean = false;
    }
    if (commandblocksscore >= 1) {
        removecmdblocksBoolean = true;
    }
    modulescommandblocksui.title("§4メニュー：Command Blocks§4");
    modulescommandblocksui.toggle("Override Command Blocks - commandblocksenabled gameruleを常にBooleanまたは無効にします：", cmdoBoolean);
    modulescommandblocksui.toggle("アンチコマンドブロック（Anti Command Blocks） - Booleanにすると、すべてのコマンドブロックをクリアする：", removecmdblocksBoolean);
    modulescommandblocksui
        .show(player)
        .then((commandblockResult) => {
            uiCOMMANDBLOCKS(commandblockResult, player);
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
