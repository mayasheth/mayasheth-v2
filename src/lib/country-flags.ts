// Only the 2-letter codes that flag-icons actually ships (generated from its CSS).
// Using this list instead of A-Z avoids historical aliases (e.g. DY=Dahomey)
// overwriting current codes (BJ=Benin) due to alphabetical iteration order.
const FLAG_ICONS_CODES = [
  "ad", "ae", "af", "ag", "ai", "al", "am", "ao", "aq", "ar", "as", "at",
  "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi",
  "bj", "bl", "bm", "bn", "bo", "bq", "br", "bs", "bt", "bv", "bw", "by",
  "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn",
  "co", "cp", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dg", "dj",
  "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "eu",
  "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg",
  "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw",
  "gy", "hk", "hm", "hn", "hr", "ht", "hu", "ic", "id", "ie", "il", "im",
  "in", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg",
  "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc",
  "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me",
  "mf", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms",
  "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng",
  "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pc", "pe", "pf",
  "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa",
  "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh",
  "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "sv", "sx",
  "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn",
  "to", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "um", "un", "us", "uy",
  "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xk", "xx",
  "ye", "yt", "za", "zm", "zw",
];

function buildBaseMap(): Record<string, string> {
  const dn = new Intl.DisplayNames(["en"], { type: "region" });
  const map: Record<string, string> = {};
  for (const code of FLAG_ICONS_CODES) {
    try {
      const name = dn.of(code.toUpperCase());
      if (name && name !== code.toUpperCase()) map[name] = code;
    } catch {
      // unsupported code
    }
  }
  return map;
}

// Names used in the ATW collection that differ from Intl.DisplayNames en output.
// Includes: common-name variants, alternate spellings, regional flags.
const ALIASES: Record<string, string> = {
  "Antigua and Barbuda": "ag",
  "Bosnia and Herzegovina": "ba",
  "Brunei Darussalam": "bn",
  "Cabo Verde": "cv",
  "Catalonia": "es-ct",
  "Congo": "cg",
  "Czech Republic": "cz",
  "Democratic Republic of the Congo": "cd",
  "Guinea Bissau": "gw",
  "Myanmar": "mm",
  "Palestine": "ps",
  "Saint Kitts and Nevis": "kn",
  "Saint Lucia": "lc",
  "Saint Vincent and the Grenadines": "vc",
  "Sao Tome and Principe": "st",
  "Trinidad and Tobago": "tt",
  "Turkey": "tr",
  "United States of America": "us",
  // Côte d'Ivoire with straight apostrophe (U+0027) vs Intl's curly (U+2019)
  "Côte d'Ivoire": "ci",
};

const NAME_TO_CODE: Record<string, string> = { ...buildBaseMap(), ...ALIASES };

/**
 * Returns the lowercase flag-icons code for a location name (e.g. "us", "es-ct"),
 * or null if no flag is available.
 */
export function getFlagCode(name: string): string | null {
  return NAME_TO_CODE[name] ?? null;
}
