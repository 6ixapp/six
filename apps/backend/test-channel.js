const notificationService = require('./services/notificationService');

async function testChannelNotification() {
    console.log('Testing channel notification...');

    // Test new user notification
    const testUserData = {
        firstName: "Test User",
        phoneNumber: "1234567890",
        gender: "male",
        age: "25",
        instagram: "testuser",
        lookingFor: "friend"
    };

    console.log('Sending test notification to channel...');
    await notificationService.notifyNewUser(testUserData);
    console.log('Test notification sent!');
}

testChannelNotification().catch(console.error); 