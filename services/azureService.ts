import { ContainerClient } from '@azure/storage-blob';

export const uploadToAzure = async (file: File, containerSasUrl: string): Promise<string> => {
  try {
    // Initialize the container client using the SAS URL
    const containerClient = new ContainerClient(containerSasUrl);
    
    // Create a unique name for the blob
    const blobName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Upload the file
    await blockBlobClient.uploadData(file, {
      blobHTTPHeaders: { blobContentType: file.type }
    });

    // Return the URL. 
    // Note: For the browser to view this URL without a SAS token, 
    // the container Access Level must be set to "Blob" (Public read access for blobs only).
    return blockBlobClient.url;
  } catch (error) {
    console.error("Azure upload failed", error);
    throw error;
  }
};