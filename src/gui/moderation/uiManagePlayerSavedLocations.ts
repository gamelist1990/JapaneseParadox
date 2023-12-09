import { Player, world } from "@minecraft/server";
import { ModalFormData, ModalFormResponse } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry";
import { sendMsgToPlayer } from "../../util";
import { paradoxui } from "../paradoxui";
import { WorldExtended } from "../../classes/WorldExtended/World";

export function uiManagePlayerSavedLocations(managePlayerSavedLocationsUIResult: ModalFormResponse, onlineList: string[], player: Player) {
    handleUImanagePlayerSavedLocations(managePlayerSavedLocationsUIResult, onlineList, player).catch((error) => {
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
async function handleUImanagePlayerSavedLocations(managePlayerSavedLocationsUIResult: ModalFormResponse, onlineList: string[], player: Player) {
    const [value] = managePlayerSavedLocationsUIResult.formValues;
    let member: Player = undefined;
    const players = world.getPlayers();
    for (const pl of players) {
        if (pl.name.toLowerCase().includes(onlineList[value as number].toLowerCase().replace(/"|\\|@/g, ""))) {
            member = pl;
            break;
        }
    }
    // ユニークIDの取得
    const uniqueId = dynamicPropertyRegistry.getProperty(player, player?.id);
    // ユーザーにコマンドを実行する権限があることを確認する。
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§fあなたはパラドックス・オップされる必要がある。`);
    }

    // オンラインですか？
    if (!member) {
        return sendMsgToPlayer(player, `§f§4[§6パラドックス§4]§f その選手は見つからなかった！`);
    }

    //選択した選手の保存場所を取得する。
    const salt = world.getDynamicProperty("crypt");
    const tags = member.getTags();
    const tagsLength = tags.length;
    let counter = 0;
    const Locations: string[] = [];
    const coordsArray: string[] = [];
    for (let i = 0; i < tagsLength; i++) {
        if (tags[i].startsWith("1337")) {
            // それを検証するためにデコードする
            tags[i] = (world as WorldExtended).decryptString(tags[i], salt as string);
            // 無効な場合はスキップする
            if (tags[i].startsWith("LocationHome:") === false) {
                continue;
            }
            // 文字列を配列に分割する
            const coordinatesArray = tags[i].split(" ");
            const coordArrayLength = coordinatesArray.length;
            counter = ++counter;
            for (let i = 0; i < coordArrayLength; i++) {
                // 配列から位置を取得する
                coordsArray.push(coordinatesArray[i]);
                if (coordinatesArray[i].includes("LocationHome:")) {
                    Locations.push(coordinatesArray[i].replace("LocationHome:", ""));
                }
                continue;
            }
        }
    }
    if (Locations.length === 0) {
        /*No locations saved so it will crap its self!
        So if there is no data we push a line to keep the array with at least 1 value.
        If there are saved locations then it will continue as normal.
        */
        Locations.push("This player has not saved a Location");
    }
    /*no we have the selected player and have the locations in an array we will build a UI
    to show the player, where they can then remove the location if needed.
    */
    const managePlayerSavedLocationsUI = new ModalFormData();
    managePlayerSavedLocationsUI.title(`§4§6${member.name}'の §4座標！`);
    managePlayerSavedLocationsUI.dropdown(`\n場所選択：§f 保存場所：§f`, Locations);
    managePlayerSavedLocationsUI.toggle("消去", false);
    managePlayerSavedLocationsUI
        .show(player)
        .then((managePlayerSavedLocationsUIResult) => {
            const [selectedLocationvalue, deleteToggle] = managePlayerSavedLocationsUIResult.formValues;
            if (deleteToggle == true) {
                const salt = world.getDynamicProperty("crypt");
                // この保存されたホームロケーションを検索して削除する
                let encryptedString: string = "";
                const tags = member.getTags();
                const tagsLength = tags.length;
                for (let i = 0; i < tagsLength; i++) {
                    if (tags[i].startsWith("1337")) {
                        encryptedString = tags[i];
                        // それを検証するためにデコードする
                        tags[i] = (world as WorldExtended).decryptString(tags[i], salt as string);
                    }
                    if (tags[i].startsWith("LocationHome:" && Locations[selectedLocationvalue as number] + " X", 13)) {
                        member.removeTag(encryptedString);
                        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 座標を消去しました！！ '§7${Locations[selectedLocationvalue as number]}§f'!`);
                        break;
                    }
                }
                return paradoxui(player);
            }
            return paradoxui(player);
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
