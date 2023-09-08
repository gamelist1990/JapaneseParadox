import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { uiBAN } from "../../../moderation/uiBan";

export function banHandler(player: Player) {
    //show ban ui here
    const banui = new ModalFormData();
    let onlineList: string[] = [];

    banui.title("§4メニュー：ユーザーをBANします§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    banui.dropdown(`\n§fBANするユーザーを選択§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    banui.textField(`BAN理由:`, `理由入力.`);
    banui
        .show(player)
        .then((banResult) => {
            //ban function goes here
            uiBAN(banResult, onlineList, player);
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
