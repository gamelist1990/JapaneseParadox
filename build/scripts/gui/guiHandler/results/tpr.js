import { world } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { getTeleportRequests } from "../../../commands/utility/tpr";
import { uiTPR } from "../../moderation/uiTpr";
import { uiTPRSEND } from "../../moderation/uiTprSend";
export function tprHandler(player) {
    //TPR ui
    const tprui = new ActionFormData();
    //let onlineList: string[] = [];
    // onlineList = Array.from(world.getPlayers(), (player) => player.name);
    tprui.title("§4TPリクエスト§4");
    tprui.button("私宛のリクエスト", "textures/ui/mail_icon");
    tprui.button("TPリクエストを送る", "textures/ui/send_icon");
    tprui
        .show(player)
        .then((tprmenuResult) => {
        if (tprmenuResult.selection === 0) {
            let teleportRequests = [];
            teleportRequests = getTeleportRequests();
            const requestIndex = teleportRequests.findIndex((r) => r.target === player);
            const request = teleportRequests[requestIndex];
            let respons;
            const toMinutes = new Date(request.expiresAt);
            const tprinboxui = new MessageFormData();
            tprinboxui.title("私宛のリクエストを");
            tprinboxui.body(request.requester.name + " 下のボタンを使って、このリクエストを承認または拒否してください。 \n リクエスト一覧: " + toMinutes.getMinutes());
            tprinboxui.button1("TPを許可します");
            tprinboxui.button2("Tpを拒否します");
            tprinboxui
                .show(player)
                .then((tprInboxResult) => {
                if (tprInboxResult.selection === 0) {
                    respons = "yes";
                    uiTPR(request.requester.name, player, respons);
                }
                //beacuse for some reason the no button is 0 yet its the second control
                if (tprInboxResult.selection === 1) {
                    respons = "no";
                    uiTPR(request.requester.name, player, respons);
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
        if (tprmenuResult.selection === 1) {
            //show the ui to send a request.
            const tprsendrequestxui = new ModalFormData();
            let onlineList = [];
            onlineList = Array.from(world.getPlayers(), (player) => player.name);
            tprsendrequestxui.title("§4TPリクエストを送る§4");
            tprsendrequestxui.dropdown(`\nTPリクエストを送りたいユーザーを指定\n\n以下のプレイヤーがオンラインです\n`, onlineList);
            tprsendrequestxui
                .show(player)
                .then((tprSendRequestResult) => {
                //Send Logic
                uiTPRSEND(tprSendRequestResult, onlineList, player);
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
