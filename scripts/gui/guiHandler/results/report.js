import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { UIREPORTPLAYER } from "../../playerui/uiReport";
export function reportHandler(player) {
    //Non Opped player Report UI
    const reportplayerui = new ModalFormData();
    reportplayerui.title("§4報告§4");
                    let onlineList = [];
                    onlineList = Array.from(world.getPlayers(), (player) => player.name);
                    reportplayerui.dropdown(`\n§r報告したいプレイヤーがを選択してください！バグなどは【FairImpala41312】がオンラインだと思うのでその人に送ってね！荒らしやチーターはその荒らしのユーザーをオンラインの中から指定してこの人荒らしなどの理由で報告してね具体的だと運営としてはうれしい§r\n\n以下のプレイヤーがオンラインです\n`, onlineList);
                    reportplayerui.textField("報告したい内容を入れてください", "");
    reportplayerui
        .show(player)
        .then((reportResult) => {
        UIREPORTPLAYER(reportResult, onlineList, player);
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
