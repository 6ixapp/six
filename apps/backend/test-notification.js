const notificationService = require('./services/notificationService');

async function testNotifications() {
    console.log('Testing notification system...');

    // Test new user notification
    const testUserData = {
        firstName: "Test User",
        phoneNumber: "1234567890",
        gender: "male",
        age: "25",
        instagram: "testuser",
        lookingFor: "friend"
    };

    console.log('Sending test user notification...');
    await notificationService.notifyNewUser(testUserData);

    // Test follow request update
    console.log('Sending test follow request update...');
    await notificationService.notifyFollowRequestUpdate("testuser", "Request Sent");

    console.log('Test notifications sent!');
}

testNotifications().catch(console.error); 