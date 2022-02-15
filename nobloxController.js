const noblox = require("noblox.js")
const fs = require("fs")

const uploadTOnoblox = async (data) => {

    let assetResult
    const splitresult = data.assetPath.split(".")
    const assetExt = splitresult[splitresult.length - 1]

    if (assetExt === 'rbxm') {
        const itemOptions = {
            name: data.assetName,
            description: data.assetDescription || "No description",
            copyLocked: false,
            allowComments: false
        }
        assetResult = await noblox.uploadModel(
            fs.createReadStream(`uploads/${data.assetPath}`),
            itemOptions,
            data.assetId || undefined)

        // assetResult = await noblox.uploadAnimation(
        //     fs.createReadStream(`uploads/${data.assetPath}`),
        //     itemOptions,
        //     data.assetId || undefined)

    } else {
        assetResult = await noblox.uploadItem(
            data.assetName,
            data.assetType,
            fs.createReadStream(`uploads/${data.assetPath}`))
    }
    return assetResult

}

exports.uploadTOnoblox = uploadTOnoblox