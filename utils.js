import axios from "axios";
import { styleText } from "node:util";

// returns an array of all members in SimplyPlural system
export const getAllMembers = async () => {
    const systemId = process.env.SIMPLYPLURAL_SYSTEM_ID;

    try {
        const allMembers = await axios.get(
            `https://api.apparyllis.com/v1/members/${systemId}`,
            {
                headers: {
                    Authorization: process.env.SIMPLYPLURAL_TOKEN,
                },
            }
        );

        return allMembers.data;
    } catch (error) {
        if (error.status === 401) {
            throw new Error(
                "failed to authorize with simplyplural. did you set your SIMPLYPLURAL_TOKEN?"
            );
        }
        if (error.status === 403) {
            throw new Error(
                "failed to get simplyplural members. did you set your SIMPLYPLURAL_SYSTEM_ID?"
            );
        } else {
            throw new Error(error);
        }
    }
};

// get all current simplyplural fronters
export const getCurrentFronters = async () => {
    try {
        const currentFronters = await axios.get(
            "https://api.apparyllis.com/v1/fronters/",
            {
                headers: {
                    Authorization: process.env.SIMPLYPLURAL_TOKEN,
                },
            }
        );

        return currentFronters.data;
    } catch (error) {
        if (error.status === 401) {
            throw new Error(
                "failed to authorize with simplyplural. did you set your SIMPLYPLURAL_TOKEN?"
            );
        } else {
            throw new Error(error);
        }
    }
};

// returns the pluralkit member id given a simplyplural member id
// (not used)
export const getPluralKitId = async (simplyPluralId) => {
    const systemId = process.env.SIMPLYPLURAL_SYSTEM_ID;

    const member = await axios.get(
        `https://api.apparyllis.com/v1/member/${systemId}/${simplyPluralId}`,
        {
            headers: {
                Authorization: process.env.SIMPLYPLURAL_TOKEN,
            },
        }
    );

    return member.data.content.pkId;
};

// sets pluralkit fronters to a given array of pluralkit member ids
export const setPluralKitFronters = async (members) => {
    try {
        await axios.post(
            `https://api.pluralkit.me/v2/systems/@me/switches`,
            { members },
            {
                headers: {
                    Authorization: process.env.PLURALKIT_TOKEN,
                    "Content-Type": "application/json",
                    "User-Agent": "sp-pk-sync-fronters",
                },
            }
        );
    } catch (error) {
        if (error.response.data.code === 40004) {
            console.warn(
                styleText(
                    ["yellow"],
                    "member list is identical to current fronter list. no changes have been made."
                )
            );
        } else {
            throw new Error(error);
        }
    }
};
