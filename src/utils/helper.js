export const cleanTimestamp = (timestamp) => {
    return timestamp.replace('T', ' ').replace('Z', ' ');
}

export const cleanBytesString = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (!bytes || bytes === 0) {
        return '0 B';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}