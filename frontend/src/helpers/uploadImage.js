// uploadImage.js
const uploadImage = async (image) => {
    try {
        // Check if environment variables are set
        const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
        
        if (!cloudName) {
            throw new Error("REACT_APP_CLOUDINARY_CLOUD_NAME is not set in environment variables");
        }

        console.log("Cloud Name:", cloudName);
        console.log("Uploading image...", image.name);
        
        // Create FormData
        const formData = new FormData()
        formData.append("file", image)
        formData.append("upload_preset", "mern_product")
        // Don't append cloud_name to FormData - it goes in the URL
        
        // Construct the URL with your cloud name
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        console.log("Upload URL:", url);
        
        const dataResponse = await fetch(url, {
            method: "POST",
            body: formData
        })

        console.log("Response status:", dataResponse.status);
        
        const result = await dataResponse.json()
        console.log("Response body:", result);

        if (!dataResponse.ok) {
            // More detailed error info
            const errorMessage = result.error ? result.error.message : `HTTP error! status: ${dataResponse.status}`;
            throw new Error(errorMessage);
        }
        
        if (result.error) {
            throw new Error(result.error.message)
        }

        console.log("Upload successful:", result)
        return result

    } catch (error) {
        console.error("Upload failed:", error)
        throw error
    }
}

export default uploadImage