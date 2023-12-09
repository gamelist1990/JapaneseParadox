import { Vector3 } from "@minecraft/server";

// config.ts
interface ConfigInterface {
    debug: boolean;
    customcommands: {
        prefix: string;
        ban: boolean;
        clearchat: boolean;
        help: boolean;
        op: boolean;
        deop: boolean;
        credits: boolean;
        allowgma: boolean;
        allowgmc: boolean;
        allowgms: boolean;
        bedrockvalidate: boolean;
        modules: boolean;
        overidecommandblocksenabled: boolean;
        removecommandblocks: boolean;
        worldborder: boolean;
        autoclicker: boolean;
        jesusa: boolean;
        phase: boolean;
        ecwipe: boolean;
        freeze: boolean;
        stats: boolean;
        fullreport: boolean;
        kick: boolean;
        mute: boolean;
        unmute: boolean;
        fly: boolean;
        invsee: boolean;
        notify: boolean;
        rank: boolean;
        vanish: boolean;
        enchantedarmor: boolean;
        antikillaura: boolean;
        antikb: boolean;
        report: boolean;
        badpackets1: boolean;
        spammera: boolean;
        spammerb: boolean;
        spammerc: boolean;
        antispam: boolean;
        namespoofa: boolean;
        namespoofb: boolean;
        reacha: boolean;
        reachb: boolean;
        speeda: boolean;
        invalidsprinta: boolean;
        flya: boolean;
        antifalla: boolean;
        illegalitemsa: boolean;
        illegalitemsb: boolean;
        illegalitemsc: boolean;
        antiscaffolda: boolean;
        antinukera: boolean;
        xraya: boolean;
        unban: boolean;
        chatranks: boolean;
        antishulker: boolean;
        stackban: boolean;
        lockdown: boolean;
        punish: boolean;
        sethome: boolean;
        gohome: boolean;
        listhome: boolean;
        delhome: boolean;
        tpa: boolean;
        illegalenchant: boolean;
        illegallores: boolean;
        despawn: boolean;
        hotbar: boolean;
        ops: boolean;
        salvage: boolean;
        badpackets2: boolean;
        give: boolean;
        clearlag: boolean;
        showrules: boolean;
        paradoxiu: boolean;
        tpr: boolean;
        autoban: boolean;
        biome: boolean;
        afk: boolean;
        antiphasea: boolean;
        channel: boolean;
        pvp: boolean;
        spawnprotection: boolean;
    };
    modules: {
        badpackets1: {
            enabled: boolean;
            minLength: number;
            maxlength: number;
        };
        spammerA: {
            enabled: boolean;
        };
        spammerB: {
            enabled: boolean;
        };
        spammerC: {
            enabled: boolean;
        };
        antispam: {
            enabled: boolean;
        };
        namespoofA: {
            enabled: boolean;
            minNameLength: number;
            maxNameLength: number;
        };
        namespoofB: {
            enabled: boolean;
            banregex: RegExp;
            kickregex: RegExp;
        };
        bedrockValidate: {
            enabled: boolean;
            overworld: boolean;
            nether: boolean;
        };
        reachA: {
            enabled: boolean;
            reach: number;
        };
        reachB: {
            enabled: boolean;
            reach: number;
        };
        jesusA: {
            enabled: boolean;
        };
        speedA: {
            enabled: boolean;
            speed: number;
        };
        invalidsprintA: {
            enabled: boolean;
            speed: number;
        };
        flyA: {
            enabled: boolean;
        };
        antifallA: {
            enabled: boolean;
        };
        illegalitemsA: {
            enabled: boolean;
        };
        illegalitemsB: {
            enabled: boolean;
        };
        illegalitemsC: {
            enabled: boolean;
        };
        stackBan: {
            enabled: boolean;
        };
        antikbA: {
            enabled: boolean;
            velocityIntensity: number;
        };
        antiscaffoldA: {
            enabled: boolean;
        };
        antinukerA: {
            enabled: boolean;
        };
        xrayA: {
            enabled: boolean;
        };
        chatranks: {
            enabled: boolean;
        };
        antishulker: {
            enabled: boolean;
        };
        worldBorder: {
            enabled: boolean;
            nether: number;
            overworld: number;
            end: number;
        };
        survivalGM: {
            enabled: boolean;
        };
        adventureGM: {
            enabled: boolean;
        };
        creativeGM: {
            enabled: boolean;
        };
        setHome: {
            max: number;
        };
        goHome: {
            seconds: number;
            minutes: number;
            hours: number;
            days: number;
        };
        clearLag: {
            enabled: boolean;
            seconds: number;
            minutes: number;
            hours: number;
            days: number;
        };
        illegalEnchantment: {
            enabled: boolean;
        };
        illegalLores: {
            enabled: boolean;
            exclude: string;
        };
        hotbar: {
            enabled: boolean;
            message: string;
        };
        ops: {
            enabled: boolean;
        };
        salvage: {
            enabled: boolean;
        };
        badpackets2: {
            enabled: boolean;
        };
        showrules: {
            enabled: boolean;
            kick: boolean;
            rule1: string;
            rule2: string;
            rule3: string;
            rule4: string;
            rule5: string;
        };
        paradoxui: {
            enabled: boolean;
        };
        tprExpiration: {
            seconds: number;
            minutes: number;
            hours: number;
            days: number;
        };
        banAppeal: {
            enabled: boolean;
            discordLink: string;
        };
        autoBan: {
            enabled: boolean;
            banHammerInterval: number;
        };
        antiKillAura: {
            enabled: boolean;
        };
        afk: {
            enabled: boolean;
            minutes: number;
        };
        antiphaseA: {
            enabled: boolean;
        };
        lockdown: {
            enabled: boolean;
        };
        spawnprotection: {
            enabled: boolean;
            radius: number;
            vector3: Vector3;
        };
        autoclicker: {
            enabled: boolean;
        };
    };
    encryption: {
        password: string;
    };
}

export default ConfigInterface;
