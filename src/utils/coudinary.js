import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const response = await cloudinary.uploader.upload(filePath, {
      //method forr uploading file on cloudinary
      resource_type: "auto",
    });
    console.log(response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
    console.log(error); //if the file upload failed it will delete the file from temp
  }
  console.log("ulpoad method works");
};

export { uploadOnCloudinary };
