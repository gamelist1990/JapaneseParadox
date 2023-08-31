export default {
    debug: true,
    customcommands: {
        prefix: "!",
        ban: true,
        clearchat: true,
        help: true,
        op: true,
        deop: true,
        credits: true,
        allowgma: true,
        allowgmc: true,
        allowgms: true,
        bedrockvalidate: true,
        modules: true,
        overidecommandblocksenabled: true,
        removecommandblocks: true,
        worldborder: true,
        autoclicker: true,
        jesusa: true,
        phase: true,
        ecwipe: true,
        freeze: true,
        stats: true,
        fullreport: true,
        kick: true,
        mute: true,
        unmute: true,
        fly: true,
        invsee: true,
        notify: true,
        tag: true,
        vanish: true,
        enchantedarmor: true,
        antikillaura: true,
        antikb: true,
        report: true,
        badpackets1: true,
        spammera: true,
        spammerb: true,
        spammerc: true,
        antispam: true,
        crashera: true,
        namespoofa: true,
        namespoofb: true,
        reacha: true,
        reachb: true,
        noslowa: true,
        invalidsprinta: true,
        flya: true,
        antifalla: true,
        illegalitemsa: true,
        illegalitemsb: true,
        illegalitemsc: true,
        antiscaffolda: true,
        antinukera: true,
        xraya: true,
        unban: true,
        chatranks: true,
        antishulker: true,
        stackban: true,
        lockdown: true,
        punish: true,
        sethome: true,
        gohome: true,
        listhome: true,
        delhome: true,
        tpa: true,
        illegalenchant: true,
        illegallores: true,
        despawn: true,
        hotbar: true,
        ops: true,
        salvage: true,
        badpackets2: true,
        give: true,
        clearlag: true,
        showrules: true,
        paradoxiu: true,
        tpr: true,
        autoban: true,
        biome: true,
        afk: true,
        antiphasea: true,
        channel: true,
    },
    modules: {
        badpackets1: {
            enabled: true,
            minLength: 1,
            maxlength: 512,
        },
        spammerA: {
            enabled: true,
        },
        spammerB: {
            enabled: true,
        },
        spammerC: {
            enabled: true,
        },
        antispam: {
            enabled: true,
        },
        crasherA: {
            enabled: true,
        },
        namespoofA: {
            enabled: true,
            minNameLength: 3,
            maxNameLength: 16,
        },
        namespoofB: {
            enabled: true,
            banregex: /[^\x00-\x7F]|[/:\\*?"<>]|^\.$|\.$/gu,
            // Deny any invalid character not within the scope of this regex
            // Only kick because playstation and switch consoles are able to rename themselves
            kickregex: /^((?![a-zA-Z0-9_]{3,16}$).)*$/g,
        },
        bedrockValidate: {
            enabled: true,
            overworld: true,
            nether: true,
        },
        reachA: {
            enabled: true,
            reach: 6,
        },
        reachB: {
            enabled: true,
            reach: 5,
        },
        jesusA: {
            enabled: false,
        },
        noslowA: {
            enabled: true,
            speed: 12.84,
        },
        invalidsprintA: {
            enabled: true,
            speed: 8.21,
        },
        flyA: {
            enabled: true,
        },
        antifallA: {
            enabled: true,
        },
        illegalitemsA: {
            enabled: false,
        },
        illegalitemsB: {
            enabled: false,
        },
        illegalitemsC: {
            enabled: true,
        },
        stackBan: {
            enabled: false,
        },
        antikbA: {
            enabled: false,
            magnitude: -0.078,
        },
        antiscaffoldA: {
            enabled: true,
            max: 13,
        },
        antinukerA: {
            enabled: true,
        },
        xrayA: {
            enabled: true,
        },
        chatranks: {
            enabled: true,
        },
        antishulker: {
            enabled: false,
        },
        lockDown: {
            enabled: false,
        },
        worldBorder: {
            enabled: false,
            nether: 0,
            overworld: 0,
            end: 0,
        },
        survivalGM: {
            enabled: false,
        },
        adventureGM: {
            enabled: false,
        },
        creativeGM: {
            enabled: false,
        },
        setHome: {
            enabled: true,
            max: 10,
        },
        goHome: {
            seconds: 10,
            minutes: 0,
            hours: 0,
            days: 0,
        },
        clearLag: {
            enabled: false,
            seconds: 0,
            minutes: 10,
            hours: 0,
            days: 0,
        },
        illegalEnchantment: {
            enabled: false,
        },
        illegalLores: {
            enabled: false,
            exclude: "(+DATA)",
        },
        hotbar: {
            enabled: false,
            message: "通知機能が有効です", // Put Message inside the quotes
        },
        ops: {
            enabled: false,
        },
        salvage: {
            enabled: false,
        },
        badpackets2: {
            enabled: true,
        },
        showrules: {
            enabled: true,
            rule1: "ルール1: チートはダメ！！",
            rule2: "ルール2: 人の許可なく建築を破壊しない",
            rule3: "ルール3: スパム行為などは禁止！！",
            rule4: "ルール4: みんなで仲良くしてね",
            rule5: "ルール5: !helpでコマンドが使えます確認してみてね",
        },
        paradoxui: {
            enabled: true,
        },
        tprExpiration: {
            seconds: 10,
            minutes: 0,
            hours: 0,
            days: 0,
        },
        banAppeal: {
            enabled: true,
            discordLink: "異議がある場合Discordで連絡してください",
        },
        autoBan: {
            enabled: false,
            //Time interval in ticks 1 second = 20 ticks
            banHammerInterval: 6000,
        },
        antiKillAura: {
            enabled: true,
        },
        afk: {
            enabled: true,
            minutes: 10,
        },
        antiphaseA: {
            enabled: true,
        },
    },
    /**
     * Set your password here.
     *
     * This is required for Realm users to gain Paradox-Op.
     *
     * Anyone else is welcome to use this if they like but
     * レルムズで使用する場合はパスワードを設定してください！！
     */
    encryption: {
        password: "",
    },
};
