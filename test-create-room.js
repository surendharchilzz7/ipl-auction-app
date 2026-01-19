const { createRoom } = require('./backend/roomManager');

try {
    console.log('Testing createRoom...');
    const room = createRoom('TestUser', 'socket_123', { allowAI: false });
    console.log('Room created successfully:', room.id);

    const serializeRoom = require('./backend/utils/serializeRoom');
    console.log('Testing serialization...');
    const serialized = serializeRoom(room);
    console.log('Serialized successfully:', serialized.id);
} catch (err) {
    console.error('CRASH REPRODUCED:');
    console.error(err);
}
