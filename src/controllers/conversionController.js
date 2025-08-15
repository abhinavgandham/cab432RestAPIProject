const { handleFileConvert } = require('../middleware/fileConvert');

const convertFile = async (req, res) => {
    try {
        await handleFileConvert(req, res)
    } catch(error) {
        return res.status(500).json({message: "An unexpected error occured."})
    }
}

module.exports = {convertFile};