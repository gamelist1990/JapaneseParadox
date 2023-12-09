import { Player } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { dynamicPropertyRegistry } from "../../../../penrose/WorldInitializeAfterEvent/registry";
import { uiSpawnProtection } from "../../../modules/uispawnProtections";
import ConfigInterface from "../../../../interfaces/Config";

export function spawnProtectionHandler(player: Player) {
    const modulesspui = new ModalFormData();
    const configuration = dynamicPropertyRegistry.getProperty(undefined, "paradoxConfig") as ConfigInterface;
    const spawnprotectionBoolean = configuration.modules.spawnprotection.enabled;
    const spawnProtectionVector3 = configuration.modules.spawnprotection.vector3;
    const spawnProtectionRadius = configuration.modules.spawnprotection.radius;
    modulesspui.title("§4Spawn Protectionメニュー§4");
    modulesspui.toggle("スポーンプロテクションをBooleanにする", spawnprotectionBoolean);
    modulesspui.textField("X座標", "0", spawnProtectionVector3.x.toString());
    modulesspui.textField("Y座標", "0", spawnProtectionVector3.y.toString());
    modulesspui.textField("Z座標", "0", spawnProtectionVector3.z.toString());
    modulesspui.textField("半径", "90", spawnProtectionRadius.toString());
    modulesspui
        .show(player)
        .then((spawnProtectionResult) => {
            uiSpawnProtection(spawnProtectionResult, player);
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
