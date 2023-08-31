import { ModalFormData } from "@minecraft/server-ui";
import { uiDESPAWNER } from "../../../moderation/uiDespawner";
export function despawnHandler(player) {
    const despawnerui = new ModalFormData();
    despawnerui.title("§4モブをキルします§4");
                        despawnerui.textField("デスポーンさせたいモブを入力する：", "例:cow等");
                        despawnerui.toggle("ロードされたチャンク内のすべてのエンティティをキルする：", false);
    despawnerui
        .show(player)
        .then((despawnerResult) => {
        uiDESPAWNER(despawnerResult, player);
    })
        .catch((error) => {
        console.error("Paradox Unhandled Rejection: ", error);
        // Extract stack trace information
        if (error instanceof Error) {
            const stackLines = error.stack.split("\n");
            if (stackLines.length > 1) {
                const sourceInfo = stackLines;
                console.error("Error originated from:", sourceInfo[0]);
            }
        }
    });
}
