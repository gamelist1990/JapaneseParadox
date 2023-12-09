import { Player, world } from "@minecraft/server";
import { MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { uiPUNISH } from "../../../moderation/uiPunish";
import { paradoxui } from "../../../paradoxui";

export function punishHandler(player: Player) {
    //PunishのUIは、2つのフォームを使うつもりです。1つはYES/NOのメッセージで、これで何ができるかをアドバイスします。
    const punishprewarnui = new MessageFormData();
    punishprewarnui.title("§4Punishメニュー§4");
    punishprewarnui.body("これにより、プレイヤーのエンダーチェストとインベントリを消去することができる。");
    punishprewarnui.button1("続ける");
    punishprewarnui.button2("戻る");
    punishprewarnui
        .show(player)
        .then((prewarnResult) => {
            if (prewarnResult.selection === 0) {
                //罰を与えるUIを表示する
                const punishui = new ModalFormData();
                let onlineList: string[] = [];
                onlineList = Array.from(world.getPlayers(), (player) => player.name);
                punishui.title("§4Punish§4");
                punishui.dropdown(`\n§f指定したユーザーをwipe:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
                punishui
                    .show(player)
                    .then((punishResult) => {
                        uiPUNISH(punishResult, onlineList, player);
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
            } else if (prewarnResult.selection === 1 || prewarnResult.canceled) {
                paradoxui(player);
            }
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
