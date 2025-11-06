export default function formatTime(unixTime: number) {
    return new Date(unixTime * 1000).toLocaleTimeString('en-US')
}
