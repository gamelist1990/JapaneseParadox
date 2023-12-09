import { Player, world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiCHATRANKS } from "../../../../moderation/uiChatranks";
import ConfigInterface from "../../../../../interfaces/Config";

export function chatRanksHandler(player: Player) {
    //チャットランク
    const chatranksui = new ModalFormData();
    let onlineList: string[] = [];
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const chatranksBoolean = configuration.modules.chatranks.enabled;
    chatranksui.title("§4Change A Player's Chat Rankメニュー§4");
    onlineList = Array.from(world.getPlayers(), (player) => player.name);
    const predefinedrank: string[] = ["Owner", "Admin", "Mod", "Member"];
    chatranksui.dropdown(`\n§f指定したユーザーをchange their rank:§f\n\n以下のユーザーがオンラインです！\n`, onlineList);
    chatranksui.dropdown(`\n§f事前に定義されたランクを選択するか、以下のカスタムランクを設定することができます。:§f`, predefinedrank);
    chatranksui.textField("カスタムランクを入力してください：", "ビップ");
    chatranksui.toggle("チャットランク - チャットランクをBooleanまたは無効にします：", chatranksBoolean);
    chatranksui
        .show(player)
        .then((chatranksResult) => {
            uiCHATRANKS(chatranksResult, onlineList, predefinedrank, player);
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
