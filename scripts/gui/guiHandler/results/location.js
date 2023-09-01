import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { decryptString, encryptString, sendMsgToPlayer } from "../../../util";
import config from "../../../data/config";
import { uiSAVEDLOCATIONS } from "../../playerui/uiSavedLocations";
export function locationHandler(player) {
    //No Opped Menu to show Saved Locations
    const savedlocationsui = new ModalFormData();
    // Hash the coordinates for security
    const salt = world.getDynamicProperty("crypt");
    const tags = player.getTags();
    const tagsLength = tags.length;
    let counter = 0;
    const Locations = [];
    const coordsArray = [];
    for (let i = 0; i < tagsLength; i++) {
        // 6f78 is temporary and will be removed
        if (tags[i].startsWith("6f78")) {
            // Remove old encryption
            player.removeTag(tags[i]);
            // Change to AES Encryption so we can abandon the old method
            tags[i] = decryptString(tags[i], salt);
            tags[i] = encryptString(tags[i], salt);
            player.addTag(tags[i]);
        }
        if (tags[i].startsWith("1337")) {
            // Decode it so we can verify it
            tags[i] = decryptString(tags[i], salt);
            // If invalid then skip it
            if (tags[i].startsWith("LocationHome:") === false) {
                continue;
            }
            // Split string into array
            const coordinatesArray = tags[i].split(" ");
            const coordArrayLength = coordinatesArray.length;
            counter = ++counter;
            for (let i = 0; i < coordArrayLength; i++) {
                // Get their location from the array
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
        Locations.push("保存されている座標はありません");
    }
    savedlocationsui.title("§4座標保存§4");
    savedlocationsui.dropdown(`\n§r座標を選択してください新しく座標を作る際日本語では無く英語またはローマ字で保存してください例:home,ie,kouenn,niwa,等§r\n\n以下の座標が保存されています\n`, Locations);
    savedlocationsui.toggle("選択した座標にTP【使う時オン】", false);
    savedlocationsui.toggle("選択した座標を削除します【消すときだけオンにしてね】", false);
    savedlocationsui.textField("ここの下に名前を入れると今いる座標が保存されます【例:home】", "");
    if (config.customcommands.sethome === true && config.customcommands.delhome === true && config.customcommands.listhome === true && config.customcommands.gohome === true) {
        savedlocationsui.show(player).then((savedlocationsResult) => {
            uiSAVEDLOCATIONS(savedlocationsResult, Locations, player, coordsArray);
        });
    }
    else {
        sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r セーブした座標は削除されました!`);
        return;
    }
}
