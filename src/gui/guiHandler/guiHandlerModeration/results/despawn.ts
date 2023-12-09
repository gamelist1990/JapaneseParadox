import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiDESPAWNER } from "../../../moderation/uiDespawner";

export function despawnHandler(player: Player) {
    const despawnerui = new ModalFormData();
    despawnerui.title("§4Despawn Entitiesメニュー§4");
    despawnerui.textField("デスポーンするエンティティ名を入力する：", "匍匐茎");
    despawnerui.toggle("ロードされたチャンク内のすべてのエンティティをデスポーンする：", false);
    despawnerui
        .show(player)
        .then((despawnerResult) => {
            uiDESPAWNER(despawnerResult, player);
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
