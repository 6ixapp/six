const notificationService = require('./services/notificationService');

async function testMultipleChats() {
    console.log('Testing multiple chat notifications...');

    // Test adding new chat IDs
    const testChatIds = [
        process.env.TELEGRAM_CHAT_IDS.split(',')[0], // Keep existing chat ID
        '-1001234567890', // Example group chat ID
        '987654321'      // Example individual chat ID
    ];

    console.log('Adding test chat IDs...');
    for (const chatId of testChatIds) {
        await notificationService.addChatId(chatId);
    }

    // Test new user notification
    const testUserData = {
        firstName: "Test User",
        phoneNumber: "1234567890",
        gender: "male",
        age: "25",
        instagram: "testuser",
        lookingFor: "friend"
    };

    console.log('Sending test user notification to all chats...');
    await notificationService.notifyNewUser(testUserData);

    // Test follow request update
    console.log('Sending test follow request update to all chats...');
    await notificationService.notifyFollowRequestUpdate("testuser", "Request Sent");

    console.log('Test notifications sent to all configured chats!');
}

testMultipleChats().catch(console.error); 