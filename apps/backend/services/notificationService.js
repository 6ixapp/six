const axios = require('axios');
require('dotenv').config();

class NotificationService {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.channelId = process.env.TELEGRAM_CHANNEL_ID;
  }

  async sendTelegramNotification(message, photoUrl = null) {
    try {
      const telegramApiUrl = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      const telegramPhotoUrl = `https://api.telegram.org/bot${this.botToken}/sendPhoto`;

      if (photoUrl) {
        // Send photo with caption
        const photoResponse = await fetch(telegramPhotoUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: this.channelId,
            photo: photoUrl,
            caption: message,
            parse_mode: 'HTML'
          }),
        });

        if (!photoResponse.ok) {
          throw new Error('Failed to send photo notification');
        }
      } else {
        // Send text message only
        const response = await fetch(telegramApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: this.channelId,
            text: message,
            parse_mode: 'HTML'
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send notification');
        }
      }

      console.log('Telegram notification sent successfully');
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      throw error;
    }
  }

  formatUserNotification(userData) {
    // Handle undefined values
    const name = userData.name || userData.firstName || 'Not provided';
    const phone = userData.phone || userData.phoneNumber || 'Not provided';
    const gender = userData.gender || 'Not provided';
    const age = userData.age || 'Not provided';
    const instagram = userData.instagram || '';
    const lookingFor = userData.lookingFor || 'Not specified';
    
    // Get photo source from the correct property
    const photoSource = userData.photoSource === 'instagram' ? '📸 Instagram Profile Photo' : 
                       userData.photoSource === 'firebase' ? '📸 Camera Roll Photo' : 
                       userData.photoSource === 'camera' ? '📸 Camera Roll Photo' :
                       '📸 No Photo Selected';
    
    return `🆕 New User Registration!

👤 Name: ${name}
📱 Phone: ${phone}
👥 Gender: ${gender}
📅 Age: ${age}
${instagram ? `📸 Instagram: @${instagram}` : ''}
🎯 Looking For: ${lookingFor}
${photoSource}`;
  }

  async notifyNewUser(userData) {
    try {
      console.log('User data received for notification:', userData); // Debug log
      const message = this.formatUserNotification(userData);
      await this.sendTelegramNotification(message, userData.photoUrl);
    } catch (error) {
      console.error('Error notifying new user:', error);
      throw error;
    }
  }

  async notifyFollowRequestUpdate(userId, status) {
    try {
      const message = `🔄 Follow Request Update\n\nUser ID: ${userId}\nStatus: ${status}`;
      await this.sendTelegramNotification(message);
    } catch (error) {
      console.error('Error notifying follow request update:', error);
      throw error;
    }
  }

  async notifyPhotoUpload(username, source) {
    try {
      const message = `📸 Profile Photo Upload\n\nUsername: ${username}\nSource: ${source === 'instagram' ? 'Instagram Profile' : 'Camera Roll'}\nTime: ${new Date().toLocaleString()}`;
      await this.sendTelegramNotification(message);
    } catch (error) {
      console.error('Error notifying photo upload:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 