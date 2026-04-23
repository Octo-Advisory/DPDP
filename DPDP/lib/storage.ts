// Simple mock for storage service
export function getStorage() {
    return {
        upload: async (file: Blob) => {
            console.log('Mock upload:', file);
            return `https://placeholder.com/${Math.random().toString(36).substring(7)}`;
        }
    };
}
