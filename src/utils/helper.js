export const cleanTimestamp = (timestamp) => {
    return timestamp.replace('T', ' ').replace('Z', ' ');
}