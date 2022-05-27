import io from 'socket.io-client';

const useSocket = (url) => {
    const socket = io(url);
    return socket;
}

export default useSocket;