import { sendMsg } from "../../util";
import { paradoxui } from "../paradoxui";
export function uiCLEARCHAT(player) {
    for (let clear = 0; clear < 10; clear++)
        sendMsg("@a", "\n".repeat(60));
    sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f　${player.name}がチャットクリアを実行しました`);
    return paradoxui(player);
}
