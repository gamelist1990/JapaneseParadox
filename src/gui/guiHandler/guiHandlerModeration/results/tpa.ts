import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiTPA } from "../../../moderation/uiTpa";

export function tpaHandler(player: Player) {
    const tpaui = new ModalFormData();
    tpaui.title("§4Teleport Assistanceメニュー§4");
    let onlineList: string[] = [];
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    tpaui.dropdown(`\n§f指定したユーザーをteleport:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    tpaui.toggle("対象のプレイヤーにテレポートする：", true);
    tpaui.toggle("対象のプレイヤーをテレポートさせる：", false);
    tpaui
        .show(player)
        .then((tpaResult) => {
            uiTPA(tpaResult, onlineList, player);
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
