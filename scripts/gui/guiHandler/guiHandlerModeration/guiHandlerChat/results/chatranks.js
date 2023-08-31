import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiCHATRANKS } from "../../../../moderation/uiChatranks";
export function chatRanksHandler(player) {
    //Chat Ranks ui
    const chatranksui = new ModalFormData();
    let onlineList = [];
    const chatRanksBoolean = dynamicPropertyRegistry.get("chatranks_b");
    chatranksui.title("§4ランク§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    const predefinedrank = ["Owner", "Admin", "Mod", "Member"];
    chatranksui.dropdown(`\n§fプレイヤーを選択してランクを変更する:§f\n\n以下のプレイヤーがオンラインです\n`, onlineList);
    chatranksui.dropdown(`\n§f事前に定義されたランクを選択するか、以下でカスタムランクを設定することができます：§f`, predefinedrank);
    chatranksui.textField("カスタムランクを入力してください：", "例appleだとチャット欄で[apple] よろ,って表示されるよ");
    chatranksui.toggle("チャットランクを有効または無効にします：", chatRanksBoolean);
    chatranksui
        .show(player)
        .then((chatranksResult) => {
        uiCHATRANKS(chatranksResult, onlineList, predefinedrank, player);
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
