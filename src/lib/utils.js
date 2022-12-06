import { sanitize } from "dompurify";
import { user, db } from './gun'
import { parse as parseEm } from "twemoji-parser";

export async function getUserData(pub) {
    let userdata = {}
    return new Promise(async (res, rej) => {
        try {
            await db.user(pub).get("alias").once((name) => {
                userdata.name = name
            }).back().get("displayImage").once((userimg) => {
                userdata.img = userimg ||
                    `https://avatars.dicebear.com/api/initials/${userdata.name}.svg`;
            }).back().get("bio").once((userbio) => {
                userdata.bio = userbio || '404 bio not found'
            }).back().get("displayName").once((displayName) => {
                userdata.displayName = displayName
            }).then(() => {
                res(userdata)
            })
        } catch (e) {
            rej(e)
        }
    })
}

export function parseEmoji(str) {
    const entities = parseEm(str);
    let text = str;
    entities.forEach((e) => {
        text = text.replace(
            new RegExp(e.text, "g"),
            `<img src="${e.url}" draggable="false" class="h-3 mt-auto mb-auto selector" alt="" />`
        );
    });

    return text;
}

export function parse(t) {
    return sanitize(parseEmoji((t || '').replace(/#+([a-zA-Z0-9_]+)/gi, '<a class="text-blue-500" href="#/search/#$1">#$1</a>').replace(/\n/g, "<br>")));
}