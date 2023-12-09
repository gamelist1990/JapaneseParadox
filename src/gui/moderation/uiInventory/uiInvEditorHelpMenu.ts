import { ActionFormData } from "@minecraft/server-ui";
import { Player } from "@minecraft/server";
import { uiInvEditorMenu } from "./uiInvEditorMainMenu";
export function uiInvEditorHelpMenu(player: Player, targetPlayer: Player, itemSlot: number) {
    const helpMenu = new ActionFormData();
    helpMenu.title("§4ヘルプメニュー§4");
    helpMenu.body(
        "§6エンチャントメニュー§このメニューではエンチャントの追加と削除ができます。このメニューでは、アイテム名を入力することで、アイテムを入れ替えることができます。また、アイテム名を入力することで、空のインベントリスロットを選択しているプレイヤーにアイテムを渡すこともできます。 アイテムを他のプレイヤーに転送したい場合は、ドロップダウンから自分の名前を選択してください。あなたのインベントリで次に空いているアイテムスロットを調べます。"
    );
    helpMenu.button("戻る");
    helpMenu
        .show(player)
        .then((InvEditorMenuUIResult) => {
            if (InvEditorMenuUIResult.selection == 0) {
                //メインメニューに戻る
                uiInvEditorMenu(player, targetPlayer, itemSlot);
            }
        })
        .catch((error) => {
            console.error("Paradox Unhandled Rejection: ", error);
            // スタックトレース情報の抽出
            if (error instanceof Error) {
                const stackLines = error.stack.split("\n");
                if (stackLines.length > 1) {
                    const sourceInfo = stackLines;
                    console.error("Error originated from:", sourceInfo[0]);
                }
            }
        });
}
