import { ActionFormData } from "@minecraft/server-ui";
import { uiInvEditorMenu } from "./uiInvEditorMainMenu";
export function uiInvEditorHelpMenu(player, targetPlayer, itemSlot) {
    const helpMenu = new ActionFormData();
    helpMenu.title("§4使い方一覧§4");
    helpMenu.body("§6エンチャメニュー§r\nこのメニューでは、エンチャントの追加と削除ができます。.\n§6名前を付ける\n§rこのメニューでは、現在選択されているアイテムの名前を変更することができます。このメニューでは、アイテム名を入力することで、アイテムを入れ替えることができます。また、アイテム名を入力することで、空のインベントリスロットを選択しているプレイヤーにアイテムを渡すこともできます。 \アイテムを他のプレイヤーに転送したい場合は、ドロップダウンから自分の名前を選択してください。自分のインベントリで次に空いているアイテムスロットを確認します。");
    helpMenu.button("戻る");
    helpMenu
        .show(player)
        .then((InvEditorMenuUIResult) => {
        if (InvEditorMenuUIResult.selection == 0) {
            //Return to the main menu
            uiInvEditorMenu(player, targetPlayer, itemSlot);
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
