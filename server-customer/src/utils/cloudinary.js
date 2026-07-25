const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bharatdrop',
    api_key: process.env.CLOUDINARY_API_KEY || '848386419766453',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'I6AYc6dAGrMyXFmV_pZCpMT2Yps',
    secure: true
});

const uploadImage = async (imagePathOrBase64) => {
    if (!imagePathOrBase64) return null;
    
    // If it's already a hosted URL (e.g. placeholder unsplash), return it
    if (imagePathOrBase64.startsWith('http://') || imagePathOrBase64.startsWith('https://')) {
        return imagePathOrBase64;
    }

    try {
        const result = await cloudinary.uploader.upload(imagePathOrBase64, {
            folder: 'bharatdrop_documents'
        });
        return result.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error, falling back to raw base64 string:', error.message);
        // Fallback to the raw base64 data URL so the uploaded image is still displayed in the admin portal
        return imagePathOrBase64;
    }
};

module.exports = {
    cloudinary,
    uploadImage
};
