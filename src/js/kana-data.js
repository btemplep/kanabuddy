/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */ 
// KanaBuddy kana data.
// Each kana entry: { kana: <character>, romaji: [<accepted answers>] }
// Groups are shared conceptually between hiragana and katakana; each script
// has its own set of characters under the same group keys.

const KANA_DATA = {
    hiragana: {
        main: [
            { kana: "あ", romaji: ["a"] },
            { kana: "い", romaji: ["i"] },
            { kana: "う", romaji: ["u"] },
            { kana: "え", romaji: ["e"] },
            { kana: "お", romaji: ["o"] },
            { kana: "か", romaji: ["ka"] },
            { kana: "き", romaji: ["ki"] },
            { kana: "く", romaji: ["ku"] },
            { kana: "け", romaji: ["ke"] },
            { kana: "こ", romaji: ["ko"] },
            { kana: "さ", romaji: ["sa"] },
            { kana: "し", romaji: ["shi", "si"] },
            { kana: "す", romaji: ["su"] },
            { kana: "せ", romaji: ["se"] },
            { kana: "そ", romaji: ["so"] },
            { kana: "た", romaji: ["ta"] },
            { kana: "ち", romaji: ["chi", "ti"] },
            { kana: "つ", romaji: ["tsu", "tu"] },
            { kana: "て", romaji: ["te"] },
            { kana: "と", romaji: ["to"] },
            { kana: "な", romaji: ["na"] },
            { kana: "に", romaji: ["ni"] },
            { kana: "ぬ", romaji: ["nu"] },
            { kana: "ね", romaji: ["ne"] },
            { kana: "の", romaji: ["no"] },
            { kana: "は", romaji: ["ha"] },
            { kana: "ひ", romaji: ["hi"] },
            { kana: "ふ", romaji: ["fu", "hu"] },
            { kana: "へ", romaji: ["he"] },
            { kana: "ほ", romaji: ["ho"] },
            { kana: "ま", romaji: ["ma"] },
            { kana: "み", romaji: ["mi"] },
            { kana: "む", romaji: ["mu"] },
            { kana: "め", romaji: ["me"] },
            { kana: "も", romaji: ["mo"] },
            { kana: "や", romaji: ["ya"] },
            { kana: "ゆ", romaji: ["yu"] },
            { kana: "よ", romaji: ["yo"] },
            { kana: "ら", romaji: ["ra"] },
            { kana: "り", romaji: ["ri"] },
            { kana: "る", romaji: ["ru"] },
            { kana: "れ", romaji: ["re"] },
            { kana: "ろ", romaji: ["ro"] },
            { kana: "わ", romaji: ["wa"] },
            { kana: "を", romaji: ["wo", "o"] },
            { kana: "ん", romaji: ["n"] }
        ],
        dakuten: [
            { kana: "が", romaji: ["ga"] },
            { kana: "ぎ", romaji: ["gi"] },
            { kana: "ぐ", romaji: ["gu"] },
            { kana: "げ", romaji: ["ge"] },
            { kana: "ご", romaji: ["go"] },
            { kana: "ざ", romaji: ["za"] },
            { kana: "じ", romaji: ["ji", "zi"] },
            { kana: "ず", romaji: ["zu"] },
            { kana: "ぜ", romaji: ["ze"] },
            { kana: "ぞ", romaji: ["zo"] },
            { kana: "だ", romaji: ["da"] },
            { kana: "ぢ", romaji: ["ji", "di"] },
            { kana: "づ", romaji: ["zu", "du"] },
            { kana: "で", romaji: ["de"] },
            { kana: "ど", romaji: ["do"] },
            { kana: "ば", romaji: ["ba"] },
            { kana: "び", romaji: ["bi"] },
            { kana: "ぶ", romaji: ["bu"] },
            { kana: "べ", romaji: ["be"] },
            { kana: "ぼ", romaji: ["bo"] },
            { kana: "ぱ", romaji: ["pa"] },
            { kana: "ぴ", romaji: ["pi"] },
            { kana: "ぷ", romaji: ["pu"] },
            { kana: "ぺ", romaji: ["pe"] },
            { kana: "ぽ", romaji: ["po"] }
        ],
        combo: [
            { kana: "きゃ", romaji: ["kya"] },
            { kana: "きゅ", romaji: ["kyu"] },
            { kana: "きょ", romaji: ["kyo"] },
            { kana: "しゃ", romaji: ["sha", "sya"] },
            { kana: "しゅ", romaji: ["shu", "syu"] },
            { kana: "しょ", romaji: ["sho", "syo"] },
            { kana: "ちゃ", romaji: ["cha", "tya"] },
            { kana: "ちゅ", romaji: ["chu", "tyu"] },
            { kana: "ちょ", romaji: ["cho", "tyo"] },
            { kana: "にゃ", romaji: ["nya"] },
            { kana: "にゅ", romaji: ["nyu"] },
            { kana: "にょ", romaji: ["nyo"] },
            { kana: "ひゃ", romaji: ["hya"] },
            { kana: "ひゅ", romaji: ["hyu"] },
            { kana: "ひょ", romaji: ["hyo"] },
            { kana: "みゃ", romaji: ["mya"] },
            { kana: "みゅ", romaji: ["myu"] },
            { kana: "みょ", romaji: ["myo"] },
            { kana: "りゃ", romaji: ["rya"] },
            { kana: "りゅ", romaji: ["ryu"] },
            { kana: "りょ", romaji: ["ryo"] },
            { kana: "ぎゃ", romaji: ["gya"] },
            { kana: "ぎゅ", romaji: ["gyu"] },
            { kana: "ぎょ", romaji: ["gyo"] },
            { kana: "じゃ", romaji: ["ja", "jya", "zya"] },
            { kana: "じゅ", romaji: ["ju", "jyu", "zyu"] },
            { kana: "じょ", romaji: ["jo", "jyo", "zyo"] },
            { kana: "びゃ", romaji: ["bya"] },
            { kana: "びゅ", romaji: ["byu"] },
            { kana: "びょ", romaji: ["byo"] },
            { kana: "ぴゃ", romaji: ["pya"] },
            { kana: "ぴゅ", romaji: ["pyu"] },
            { kana: "ぴょ", romaji: ["pyo"] }
        ]
    },
    katakana: {
        main: [
            { kana: "ア", romaji: ["a"] },
            { kana: "イ", romaji: ["i"] },
            { kana: "ウ", romaji: ["u"] },
            { kana: "エ", romaji: ["e"] },
            { kana: "オ", romaji: ["o"] },
            { kana: "カ", romaji: ["ka"] },
            { kana: "キ", romaji: ["ki"] },
            { kana: "ク", romaji: ["ku"] },
            { kana: "ケ", romaji: ["ke"] },
            { kana: "コ", romaji: ["ko"] },
            { kana: "サ", romaji: ["sa"] },
            { kana: "シ", romaji: ["shi", "si"] },
            { kana: "ス", romaji: ["su"] },
            { kana: "セ", romaji: ["se"] },
            { kana: "ソ", romaji: ["so"] },
            { kana: "タ", romaji: ["ta"] },
            { kana: "チ", romaji: ["chi", "ti"] },
            { kana: "ツ", romaji: ["tsu", "tu"] },
            { kana: "テ", romaji: ["te"] },
            { kana: "ト", romaji: ["to"] },
            { kana: "ナ", romaji: ["na"] },
            { kana: "ニ", romaji: ["ni"] },
            { kana: "ヌ", romaji: ["nu"] },
            { kana: "ネ", romaji: ["ne"] },
            { kana: "ノ", romaji: ["no"] },
            { kana: "ハ", romaji: ["ha"] },
            { kana: "ヒ", romaji: ["hi"] },
            { kana: "フ", romaji: ["fu", "hu"] },
            { kana: "ヘ", romaji: ["he"] },
            { kana: "ホ", romaji: ["ho"] },
            { kana: "マ", romaji: ["ma"] },
            { kana: "ミ", romaji: ["mi"] },
            { kana: "ム", romaji: ["mu"] },
            { kana: "メ", romaji: ["me"] },
            { kana: "モ", romaji: ["mo"] },
            { kana: "ヤ", romaji: ["ya"] },
            { kana: "ユ", romaji: ["yu"] },
            { kana: "ヨ", romaji: ["yo"] },
            { kana: "ラ", romaji: ["ra"] },
            { kana: "リ", romaji: ["ri"] },
            { kana: "ル", romaji: ["ru"] },
            { kana: "レ", romaji: ["re"] },
            { kana: "ロ", romaji: ["ro"] },
            { kana: "ワ", romaji: ["wa"] },
            { kana: "ヲ", romaji: ["wo", "o"] },
            { kana: "ン", romaji: ["n"] }
        ],
        dakuten: [
            { kana: "ガ", romaji: ["ga"] },
            { kana: "ギ", romaji: ["gi"] },
            { kana: "グ", romaji: ["gu"] },
            { kana: "ゲ", romaji: ["ge"] },
            { kana: "ゴ", romaji: ["go"] },
            { kana: "ザ", romaji: ["za"] },
            { kana: "ジ", romaji: ["ji", "zi"] },
            { kana: "ズ", romaji: ["zu"] },
            { kana: "ゼ", romaji: ["ze"] },
            { kana: "ゾ", romaji: ["zo"] },
            { kana: "ダ", romaji: ["da"] },
            { kana: "ヂ", romaji: ["ji", "di"] },
            { kana: "ヅ", romaji: ["zu", "du"] },
            { kana: "デ", romaji: ["de"] },
            { kana: "ド", romaji: ["do"] },
            { kana: "バ", romaji: ["ba"] },
            { kana: "ビ", romaji: ["bi"] },
            { kana: "ブ", romaji: ["bu"] },
            { kana: "ベ", romaji: ["be"] },
            { kana: "ボ", romaji: ["bo"] },
            { kana: "パ", romaji: ["pa"] },
            { kana: "ピ", romaji: ["pi"] },
            { kana: "プ", romaji: ["pu"] },
            { kana: "ペ", romaji: ["pe"] },
            { kana: "ポ", romaji: ["po"] }
        ],
        combo: [
            { kana: "キャ", romaji: ["kya"] },
            { kana: "キュ", romaji: ["kyu"] },
            { kana: "キョ", romaji: ["kyo"] },
            { kana: "シャ", romaji: ["sha", "sya"] },
            { kana: "シュ", romaji: ["shu", "syu"] },
            { kana: "ショ", romaji: ["sho", "syo"] },
            { kana: "チャ", romaji: ["cha", "tya"] },
            { kana: "チュ", romaji: ["chu", "tyu"] },
            { kana: "チョ", romaji: ["cho", "tyo"] },
            { kana: "ニャ", romaji: ["nya"] },
            { kana: "ニュ", romaji: ["nyu"] },
            { kana: "ニョ", romaji: ["nyo"] },
            { kana: "ヒャ", romaji: ["hya"] },
            { kana: "ヒュ", romaji: ["hyu"] },
            { kana: "ヒョ", romaji: ["hyo"] },
            { kana: "ミャ", romaji: ["mya"] },
            { kana: "ミュ", romaji: ["myu"] },
            { kana: "ミョ", romaji: ["myo"] },
            { kana: "リャ", romaji: ["rya"] },
            { kana: "リュ", romaji: ["ryu"] },
            { kana: "リョ", romaji: ["ryo"] },
            { kana: "ギャ", romaji: ["gya"] },
            { kana: "ギュ", romaji: ["gyu"] },
            { kana: "ギョ", romaji: ["gyo"] },
            { kana: "ジャ", romaji: ["ja", "jya", "zya"] },
            { kana: "ジュ", romaji: ["ju", "jyu", "zyu"] },
            { kana: "ジョ", romaji: ["jo", "jyo", "zyo"] },
            { kana: "ビャ", romaji: ["bya"] },
            { kana: "ビュ", romaji: ["byu"] },
            { kana: "ビョ", romaji: ["byo"] },
            { kana: "ピャ", romaji: ["pya"] },
            { kana: "ピュ", romaji: ["pyu"] },
            { kana: "ピョ", romaji: ["pyo"] }
        ]
    }
};

const GROUP_LABELS = {
    main: "Main Kana",
    dakuten: "Dakuten / Handakuten",
    combo: "Combos (Yōon)"
};

// Font choices. `label` is the display name, `stack` is the CSS font-family,
// `sample` is the preview text shown next to the option, and `note` is a short
// description of the style. Google-Fonts-backed families are loaded via a
// <link> in the HTML head (no installs required).
const FONT_SAMPLE = "あいうえ　アイウエ";

const FONT_OPTIONS = [
    {
        id: "sans",
        label: "Sans (Gothic)",
        note: "clean, modern",
        sample: FONT_SAMPLE,
        stack: "'Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Meiryo', sans-serif"
    },
    {
        id: "mincho",
        label: "Mincho (Serif)",
        note: "classic printed",
        sample: FONT_SAMPLE,
        stack: "'Noto Serif JP', 'Hiragino Mincho Pro', 'Yu Mincho', 'MS Mincho', serif"
    },
    {
        id: "rounded",
        label: "Rounded",
        note: "soft, friendly",
        sample: FONT_SAMPLE,
        stack: "'Kosugi Maru', 'Rounded Mplus 1c', 'Hiragino Maru Gothic Pro', sans-serif"
    },
    {
        id: "kaisei",
        label: "Kaisei Decol",
        note: "old-style mincho",
        sample: FONT_SAMPLE,
        stack: "'Kaisei Decol', 'Yu Mincho', serif"
    },
    {
        id: "yuji",
        label: "Yuji Syuku",
        note: "traditional brush",
        sample: FONT_SAMPLE,
        stack: "'Yuji Syuku', 'Yu Mincho', serif"
    },
    {
        id: "klee",
        label: "Klee One",
        note: "textbook handwriting",
        sample: FONT_SAMPLE,
        stack: "'Klee One', 'Yu Mincho', serif"
    },
    {
        id: "hachimaru",
        label: "Hachi Maru Pop",
        note: "retro pop, rounded",
        sample: FONT_SAMPLE,
        stack: "'Hachi Maru Pop', 'Kosugi Maru', sans-serif"
    }
];

function buildDeck(selection) {
    const deck = [];
    ["hiragana", "katakana"].forEach(function (script) {
        const groups = selection[script] || [];
        groups.forEach(function (group) {
            const entries = (KANA_DATA[script] && KANA_DATA[script][group]) || [];
            entries.forEach(function (entry) {
                deck.push({
                    kana: entry.kana,
                    romaji: entry.romaji,
                    script: script,
                    group: group
                });
            });
        });
    });

    return deck;
}

function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }

    return result;
}
