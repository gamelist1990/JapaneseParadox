import { Player, Vector3 } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../penrose/WorldInitializeAfterEvent/registry";
import versionFile from "../version.js";
import { opHandler } from "./guiHandler/results/op";
import { tprHandler } from "./guiHandler/results/tpr";
import { deopHandler } from "./guiHandler/results/deop";
import { locationHandler } from "./guiHandler/results/location";
import { moderationui } from "./guiHandler/guiHandlerModeration/moderationui";
import { reportHandler } from "./guiHandler/results/report";
import { modulesui } from "./guiHandler/guiHandlerModules/modulesui";
import { prefixHandler } from "./guiHandler/results/prefix";
import { statsHandler } from "./guiHandler/results/stats";
import { chatChannelMainMenu } from "./guiHandler/results/chatChannelsMenu";
import { managePlayerSavedLocationsHandler } from "./guiHandler/guiHandlerModeration/results/managePlayersSavedLocations";
import { inventoryHandler } from "./guiHandler/guiHandlerModeration/results/inventoryui";

/**
 * @name paradoxui
 * @param {Player} player - Player object
 */
export function paradoxui(player: Player) {
    handleParadoxUI(player).catch((error) => {
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

async function handleParadoxUI(player: Player) {
    const maingui = new ActionFormData();

    const hash = player.getDynamicProperty("hash");
    const salt = player.getDynamicProperty("salt");
    const uniqueId = dynamicPropertyRegistry.get(player?.id);
    maingui.title("§4メニュー§4");
    maingui.body("§eこのメニューではTPリクエストや座標を保存そして報告機能が使えます！§e\n" + "§fVersion: §2" + versionFile.version);
    if (uniqueId !== player.name) {
        maingui.button("管理者", "textures/ui/op");
        maingui.button("TPリクエスト！", "textures/blocks/portal_placeholder");
        maingui.button("座標保存", "textures/items/compass_item");
        maingui.button("報告！", "textures/items/paper");
        maingui.button("制作途中【一時的に報告に置き換わります】", "textures/ui/mute_off");
    } else {
        maingui.button("オペレーター", "textures/ui/op");
        maingui.button("権限剝奪", "textures/items/ender_pearl");
        maingui.button("管理者メニュー", "textures/items/book_normal");
        maingui.button("アンチチート設定", "textures/blocks/command_block");
        maingui.button("起動文字変更", "textures/ui/UpdateGlyph");
        maingui.button("TPリクエスト", "textures/blocks/portal_placeholder");
        maingui.button("座標保存", "textures/items/compass_item");
        maingui.button("ユーザーログ", "textures/items/book_normal");
        maingui.button("報告！", "textures/items/paper");
        maingui.button("インベントリ確認", "textures/blocks/chest_front");
        maingui.button("パーティー", "textures/ui/mute_off");
        maingui.button("ユーザーの座標管理", "textures/items/compass_item");
    }
    maingui
        .show(player)
        .then((result) => {
            const isUnique = uniqueId !== player.name;

            if (isUnique) {
                switch (result.selection) {
                    case 0:
                        opHandler(player, uniqueId as string, salt as string, hash as string);
                        break;
                    case 1:
                        tprHandler(player);
                        break;
                    case 2:
                        locationHandler(player);
                        break;
                    case 3:
                        reportHandler(player);
                        break;
                    case 4:
                        chatChannelMainMenu(player);
                    default:
                        // Handle other selections for isUnique case
                        break;
                }
            } else {
                switch (result.selection) {
                    case 0:
                        opHandler(player, uniqueId as string, salt as string, hash as string);
                        break;
                    case 1:
                        deopHandler(player);
                        break;
                    case 2:
                        moderationui(player);
                        break;
                    case 3:
                        modulesui(player);
                        break;
                    case 4:
                        prefixHandler(player);
                        break;
                    case 5:
                        tprHandler(player);
                        break;
                    case 6:
                        locationHandler(player);
                        break;
                    case 7:
                        statsHandler(player);
                        break;
                    case 8:
                        reportHandler(player);
                        break;
                    case 9:
                        inventoryHandler(player);
                        break;
                    case 10:
                        chatChannelMainMenu(player);
                        break;
                    case 11:
                        managePlayerSavedLocationsHandler(player);
                        break;
                    default:
                        // Handle other selections for non-isUnique case
                        break;
                }
            }

            if (result.canceled && result.cancelationReason === "UserBusy") {
                paradoxui(player);
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
