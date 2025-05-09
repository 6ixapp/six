const axios = require('axios');
require('dotenv').config();

class NotificationService {
  constructor() {
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.channelId = process.env.TELEGRAM_CHANNEL_ID; // Channel ID should start with -100
  }

  async sendTelegramNotification(message) {
    try {
      if (!this.telegramBotToken || !this.channelId) {
        console.error('Telegram credentials not configured');
        return;
      }

      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      await axios.post(url, {
        chat_id: this.channelId,
        text: message,
        parse_mode: 'HTML'
      });
      console.log('Notification sent to channel successfully');
    } catch (error) {
      console.error('Error sending notification:', error.message);
    }
  }

  formatUserNotification(userData) {
    return `
🆕 New User Registration!

👤 Name: ${userData.firstName}
📱 Phone: ${userData.phoneNumber}
👥 Gender: ${userData.gender}
📅 Age: ${userData.age}
📸 Instagram: @${userData.instagram}
🎯 Looking For: ${userData.lookingFor || 'Not specified'}

⏰ Time: ${new Date().toLocaleString()}
    `;
  }

  async notifyNewUser(userData) {
    const message = this.formatUserNotification(userData);
    await this.sendTelegramNotification(message);
  }

  async notifyFollowRequestUpdate(username, status) {
    const message = `
🔄 Follow Request Update

📸 Instagram: @${username}
📊 Status: ${status}
⏰ Time: ${new Date().toLocaleString()}
    `;
    await this.sendTelegramNotification(message);
  }
}

module.exports = new NotificationService(); 