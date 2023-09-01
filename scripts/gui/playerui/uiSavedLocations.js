import { world } from "@minecraft/server";
import config from "../../data/config.js";
import { decryptString, encryptString, sendMsgToPlayer, setTimer } from "../../util.js";
import { paradoxui } from "../paradoxui.js";
export function uiSAVEDLOCATIONS(savedlocationsResult, Locations, player, coordArray) {
    if (!savedlocationsResult || savedlocationsResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [selectedLocationvalue, teleportToSelectedLocation, deleteSelectedLocation, newLocationName] = savedlocationsResult.formValues;
    let x;
    let y;
    let z;
    let dimension;
    const coordArrayLength = coordArray.length;
    for (let i = 0; i < coordArrayLength; i++) {
        if (coordArray[i].includes("LocationHome:" && Locations[selectedLocationvalue])) {
            x = parseInt(coordArray[i + 1].replace("X:", ""));
            y = parseInt(coordArray[i + 2].replace("Y:", ""));
            z = parseInt(coordArray[i + 3].replace("Z:", ""));
            dimension = coordArray[i + 4].replace("Dimension:", "");
        }
        continue;
    }
    if (teleportToSelectedLocation && deleteSelectedLocation === true) {
        //If both toggles are enabled the message bellow will be sent to the player and the UI will be dispalyed.
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  TPと消去は同時に使えません`);
        return paradoxui(player);
    }
    if (teleportToSelectedLocation === true) {
        //Teleport the player to the location set in the dropdown.
        setTimer(player.id);
        player.teleport({ x: x, y: y, z: z }, { dimension: world.getDimension(dimension), rotation: { x: 0, y: 0 }, facingLocation: { x: 0, y: 0, z: 0 }, checkForBlocks: false, keepVelocity: false });
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f TPしました`);
        return player;
    }
    if (deleteSelectedLocation === true) {
        const salt = world.getDynamicProperty("crypt");
        // Find and delete this saved home location
        let encryptedString = "";
        const tags = player.getTags();
        const tagsLength = tags.length;
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
                encryptedString = tags[i];
                // Decode it so we can verify it
                tags[i] = decryptString(tags[i], salt);
            }
            if (tags[i].startsWith("LocationHome:" && Locations[selectedLocationvalue] + " X", 13)) {
                player.removeTag(encryptedString);
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  '${Locations[selectedLocationvalue]}を消去しました'!`);
                break;
            }
        }
    }
    if (newLocationName) {
        //A value was entered execute the code bellow.
        //First check to make sure the same location name entered doesnt already exist
        let counter = 0;
        const coordArrayLength = coordArray.length;
        for (let i = 0; i < coordArrayLength; i++) {
            //Count how many tags already exist based on the array.
            if (coordArray[i].includes("LocationHome:")) {
                counter = ++counter;
            }
            if (coordArray[i].includes("LocationHome:" + newLocationName)) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 同じ名前が既に存在します`);
                return paradoxui(player);
            }
            //Check to make sure they havent exceeded the max locations in config.js
            if (counter >= config.modules.setHome.max && config.modules.setHome.enabled) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f ${config.modules.setHome.max}　座標の保存回数を超えています`);
                return paradoxui(player);
            }
            continue;
        }
        // Get current location of the player.
        const { x, y, z } = player.location;
        const currentX = x.toFixed(0);
        const currentY = y.toFixed(0);
        const currentZ = z.toFixed(0);
        let currentDimension;
        //save boolean to make sure we can save the location.
        let doSave;
        // Hash the coordinates for security
        const salt = world.getDynamicProperty("crypt");
        //Check to make sure there are no spaces in the name that has been entered.
        if (typeof newLocationName === "string" && newLocationName.includes(" ")) {
            doSave = false;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 名前の間に空白を入れないで下さい!`);
            return paradoxui(player);
        }
        // Save which dimension they were in
        if (player.dimension.id === "minecraft:overworld") {
            currentDimension = "overworld";
            doSave = true;
        }
        if (player.dimension.id === "minecraft:nether") {
            currentDimension = "nether";
            doSave = true;
        }
        if (player.dimension.id === "minecraft:the_end") {
            doSave = true;
        }
        if (doSave === true) {
            const decryptedLocationString = `座標:${newLocationName} X:${currentX} Y:${currentY} Z:${currentZ} ディメンション:${currentDimension}`;
            const security = encryptString(decryptedLocationString, salt);
            player.addTag(security);
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f　新しく座標を保存しました！！`);
        }
    }
    return paradoxui(player);
}
