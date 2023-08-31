import { world } from "@minecraft/server";
import { MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { uiPUNISH } from "../../../moderation/uiPunish";
import { paradoxui } from "../../../paradoxui";
export function punishHandler(player) {
    //Punish UI im going to use two forms one as a yes/no message so i can advise what this will do.
    const punishprewarnui = new MessageFormData();
    punishprewarnui.title("§4アイテム消去§4");
                        punishprewarnui.body("エンダーチェストとインベントリを消去する");
                        punishprewarnui.button1("実行");
                        punishprewarnui.button2("戻る");
    punishprewarnui
        .show(player)
        .then((prewarnResult) => {
        if (prewarnResult.selection === 0) {
            //show the Punish UI
            const punishui = new ModalFormData();
            let onlineList = [];
            onlineList = Array.from(world.getPlayers(), (player) => player.name);
            punishui.title("§4消去するプレイヤーを選択§4");
            punishui.dropdown(`\n§f指定してね§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
            punishui
                .show(player)
                .then((punishResult) => {
                uiPUNISH(punishResult, onlineList, player);
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
        else if (prewarnResult.selection === 1 || prewarnResult.canceled) {
            paradoxui(player);
        }
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
