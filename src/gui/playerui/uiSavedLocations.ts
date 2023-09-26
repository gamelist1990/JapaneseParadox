import { Player, world, Vector3 } from "@minecraft/server";
import { ModalFormResponse } from "@minecraft/server-ui";
import config from "../../data/config.js";
import { sendMsgToPlayer, setTimer } from "../../util.js";
import { paradoxui } from "../paradoxui.js";
import { EncryptionManager } from "../../classes/EncryptionManager.js";

export function uiSAVEDLOCATIONS(savedlocationsResult: ModalFormResponse, Locations: string[], player: Player, coordArray: string[]) {
    if (!savedlocationsResult || savedlocationsResult.canceled) {
        // Handle canceled form or undefined result
        return;
    }
    const [selectedLocationvalue, teleportToSelectedLocation, deleteSelectedLocation, newLocationName] = savedlocationsResult.formValues;
    let x: number;
    let y: number;
    let z: number;
    let dimension: string;
    const coordArrayLength = coordArray.length;
    for (let i = 0; i < coordArrayLength; i++) {
        if (coordArray[i].includes("LocationHome:" && Locations[selectedLocationvalue as number])) {
            x = parseInt(coordArray[i + 1].replace("X:", ""));
            y = parseInt(coordArray[i + 2].replace("Y:", ""));
            z = parseInt(coordArray[i + 3].replace("Z:", ""));
            dimension = coordArray[i + 4].replace("Dimension:", "");
        }
        continue;
    }
    if (teleportToSelectedLocation && deleteSelectedLocation === true) {
        //If both toggles are enabled the message bellow will be sent to the player and the UI will be dispalyed.
        sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f TPと消去は同時に使えません`);
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
        let encryptedString: string = "";
        const tags = player.getTags();
        const tagsLength = tags.length;
        for (let i = 0; i < tagsLength; i++) {
            if (tags[i].startsWith("1337")) {
                encryptedString = tags[i];
                // Decode it so we can verify it
                tags[i] = EncryptionManager.decryptString(tags[i], salt as string);
            }
            if (tags[i].startsWith("LocationHome:" && Locations[selectedLocationvalue as number] + " X", 13)) {
                player.removeTag(encryptedString);
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  座標を消去しました'${Locations[selectedLocationvalue as number]}'!`);
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
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 同じ名前の座標があります.`);
                return paradoxui(player);
            }
            //Check to make sure they havent exceeded the max locations in config.js
            if (counter >= config.modules.setHome.max && config.modules.setHome.enabled) {
                sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f  ${config.modules.setHome.max} 保存可能回数を超えています`);
                return paradoxui(player);
            }
            continue;
        }
        // Get current location of the player.
        const { x, y, z } = player.location;
        const currentX = x.toFixed(0);
        const currentY = y.toFixed(0);
        const currentZ = z.toFixed(0);
        let currentDimension: string;
        //save boolean to make sure we can save the location.
        let doSave: boolean;
        // Hash the coordinates for security
        const salt = world.getDynamicProperty("crypt");
        //Check to make sure there are no spaces in the name that has been entered.
        if (typeof newLocationName === "string" && newLocationName.includes(" ")) {
            doSave = false;
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f 空白を入れないでね`);
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
            const decryptedLocationString = `LocationHome:${newLocationName} X:${currentX} Y:${currentY} Z:${currentZ} Dimension:${currentDimension}`;
            const security = EncryptionManager.encryptString(decryptedLocationString, salt as string);
            player.addTag(security);
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f　新しい座標を保存しました.`);
        }
    }

    return paradoxui(player);
}
