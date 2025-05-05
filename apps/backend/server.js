const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const twilio = require('twilio');
const fs = require('fs');

// Get the absolute path to the .env file
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env file from:', envPath);

// Check if the .env file exists
if (fs.existsSync(envPath)) {
  console.log('.env file exists at the specified path');
} else {
  console.error('ERROR: .env file does not exist at the specified path');
}

// Load environment variables from .env file with explicit path
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

const INSTAGRAM_USERNAME = process.env.IG_USERNAME;
const INSTAGRAM_PASSWORD = process.env.IG_PASSWORD;
const COOKIES_PATH = path.join(__dirname, 'cookies.json');

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = twilio(accountSid, authToken);

// Debug Twilio configuration
console.log('Twilio configuration:');
console.log('TWILIO_ACCOUNT_SID exists:', !!process.env.TWILIO_ACCOUNT_SID);
console.log('TWILIO_AUTH_TOKEN exists:', !!process.env.TWILIO_AUTH_TOKEN);
console.log('TWILIO_PHONE_NUMBER exists:', !!process.env.TWILIO_PHONE_NUMBER);

// Import PostgreSQL models
const { User, syncDatabase } = require('./models/sequelize');

// Initialize PostgreSQL database
syncDatabase()
  .then(() => console.log('PostgreSQL database initialized'))
  .catch(err => console.error('PostgreSQL initialization error:', err));

let browser = null;
let page = null;
let isInitializing = false;

async function saveCookies(page) {
  try {
    const cookies = await page.cookies();
    await fs.promises.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
    console.log('Cookies saved successfully');
  } catch (error) {
    console.error('Error saving cookies:', error);
  }
}

async function loadCookies(page) {
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      const cookiesString = await fs.promises.readFile(COOKIES_PATH);
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
      console.log('Cookies loaded successfully');
      return true;
    }
    console.log('No cookies file found');
    return false;
  } catch (error) {
    console.error('Error loading cookies:', error);
    return false;
  }
}

async function isLoggedIn(page) {
  try {
    await page.goto('https://www.instagram.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const loginButton = await page.$('a[href="/accounts/login/"]');
    const loginForm = await page.$('input[name="username"]');
    
    if (loginButton || loginForm) {
      console.log('Not logged in - login button/form found');
      return false;
    }
    
    const profileButton = await page.$('a[href="/' + INSTAGRAM_USERNAME + '/"]');
    if (profileButton) {
      console.log('Logged in - profile button found');
      return true;
    }
    
    console.log('Login status unclear');
    return false;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

async function performLogin(page) {
  try {
    console.log('Starting login process...');
    await page.goto('https://www.instagram.com/accounts/login/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    console.log('Login form found, entering credentials...');
    
    await page.evaluate(() => {
      document.querySelector('input[name="username"]').value = '';
      document.querySelector('input[name="password"]').value = '';
    });
    
    await page.type('input[name="username"]', INSTAGRAM_USERNAME, { delay: 100 });
    await page.type('input[name="password"]', INSTAGRAM_PASSWORD, { delay: 100 });
    
    console.log('Submitting login form...');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('button[type="submit"]')
    ]);
    
    try {
      console.log('Checking for save login info popup...');
      await page.waitForSelector('button._acan._acap._acas._aj1-', { timeout: 5000 });
      await page.click('button._acan._acap._acas._aj1-');
      console.log('Handled save login info popup');
    } catch (e) {
      console.log('No save login info popup found');
    }

    try {
      console.log('Checking for notifications popup...');
      await page.waitForSelector('button._a9--._a9_1', { timeout: 5000 });
      await page.click('button._a9--._a9_1');
      console.log('Handled notifications popup');
    } catch (e) {
      console.log('No notifications popup found');
    }

    const loggedIn = await isLoggedIn(page);
    if (loggedIn) {
      console.log('Login successful, saving cookies...');
      await saveCookies(page);
      return true;
    } else {
      console.log('Login verification failed');
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

async function initializeBrowser() {
  if (isInitializing) {
    console.log('Browser initialization already in progress...');
    return;
  }

  isInitializing = true;
  
  try {
    if (!browser) {
      console.log('Initializing new browser...');
      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080'
        ],
        ignoreHTTPSErrors: true
      });
      page = await browser.newPage();
      
      page.setDefaultTimeout(30000);
      
      const cookiesLoaded = await loadCookies(page);
      let loggedIn = false;
      
      if (cookiesLoaded) {
        console.log('Checking if cookies are still valid...');
        loggedIn = await isLoggedIn(page);
        
        if (!loggedIn) {
          console.log('Cookies expired or invalid, performing fresh login...');
          if (fs.existsSync(COOKIES_PATH)) {
            fs.unlinkSync(COOKIES_PATH);
            console.log('Deleted invalid cookies');
          }
        }
      }
      
      if (!loggedIn) {
        console.log('Need to perform fresh login...');
        loggedIn = await performLogin(page);
      }
      
      if (!loggedIn) {
        throw new Error('Failed to initialize browser and login');
      }
      
      console.log('Browser initialized and logged in successfully');
    }
  } catch (error) {
    console.error('Error initializing browser:', error);
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
    throw error;
  } finally {
    isInitializing = false;
  }
}

async function followUser(targetUsername) {
  console.log(`Attempting to follow ${targetUsername}...`);
  
  try {
    const loggedIn = await isLoggedIn(page);
    if (!loggedIn) {
      console.log('Session expired, re-logging in...');
      await performLogin(page);
    }

    await page.goto(`https://www.instagram.com/${targetUsername}/`, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    await page.waitForSelector('header section', { timeout: 10000 });

    const userNotFound = await page.evaluate(() => {
      const errorText = document.querySelector('h2')?.textContent;
      return errorText?.includes('Sorry, this page isn\'t available');
    });

    if (userNotFound) {
      throw new Error('User not found or account is private');
    }

    const buttonSelectors = [
      'button._acan._acap._acas._aj1-',
      'button._acan._acap._acas',
      'button[type="button"]',
      'header section button'
    ];

    let followButton = null;
    let buttonText = '';

    for (const selector of buttonSelectors) {
      try {
        const buttons = await page.$$(selector);
        for (const btn of buttons) {
          buttonText = await page.evaluate(el => el.textContent.toLowerCase(), btn);
          if (buttonText.includes('follow')) {
            followButton = btn;
            console.log(`Found follow button with selector: ${selector}`);
            break;
          }
        }
        if (followButton) break;
      } catch (error) {
        console.log(`Selector ${selector} not found`);
      }
    }

    if (!followButton) {
      const isFollowing = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.toLowerCase().includes('following'));
      });

      if (isFollowing) {
        console.log('Already following this user');
        return true;
      }

      throw new Error('Could not find follow button');
    }

    await followButton.click();
    console.log('Clicked follow button');

    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.some(btn => btn.textContent.toLowerCase().includes('following'));
      },
      { timeout: 5000 }
    );

    console.log('Successfully followed user');
    return true;

  } catch (error) {
    console.error('Error in followUser:', error);
    throw error;
  }
}

async function checkFollowRequestAccepted(username) {
  console.log(`Checking if ${username} has accepted our follow request...`);
  
  try {
    const loggedIn = await isLoggedIn(page);
    if (!loggedIn) {
      console.log('Session expired, re-logging in...');
      await performLogin(page);
    }

    await page.goto(`https://www.instagram.com/${username}/`, { 
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for the profile page to load
    await page.waitForSelector('header section', { timeout: 10000 });

    // First check if the account is public or we're following them
    const isFollowing = await page.evaluate(() => {
      // Look for "Following" button text
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(btn => 
        btn.textContent.toLowerCase().includes('following') || 
        btn.textContent.toLowerCase().includes('requested')
      );
    });

    if (!isFollowing) {
      console.log(`We're not following ${username} anymore or something went wrong.`);
      return false;
    }

    // Check if we can see the user's posts or content
    const canSeeContent = await page.evaluate(() => {
      // Check for private account indicator
      const privateText = document.querySelector('h2')?.textContent;
      if (privateText && privateText.includes('This Account is Private')) {
        return false;
      }
      
      // Look for post elements or stories
      const posts = document.querySelectorAll('article') || 
                    document.querySelectorAll('div[role="button"]') ||
                    document.querySelectorAll('a[href*="/p/"]');
                    
      // Check if there's any content visible
      return posts.length > 0 || 
             document.body.textContent.includes('Posts') ||
             document.body.textContent.includes('Followers') ||
             document.body.textContent.includes('Following');
    });

    if (canSeeContent) {
      console.log(`We can see ${username}'s content - either it's a public account or they accepted our request!`);
      return true;
    } else {
      // Check if we've requested to follow but they haven't accepted yet
      const isPending = await page.evaluate(() => {
        return document.body.textContent.includes('Requested') || 
               document.body.textContent.includes('This Account is Private');
      });
      
      if (isPending) {
        console.log(`We've requested to follow ${username} but they haven't accepted yet.`);
        return false;
      } else {
        // If we're following and can see content, it must be accepted
        console.log(`We're following ${username} and can see their content - request accepted!`);
        return true;
      }
    }
  } catch (error) {
    console.error(`Error checking follow request status for ${username}:`, error);
    return false;
  }
}

async function sendSMS(phoneNumber, username) {
  // Ensure phone number is in E.164 format
  const formattedPhone = formatPhoneNumber(phoneNumber);
  console.log(`Attempting to send SMS to ${formattedPhone}`);

  try {
    const message = await twilioClient.messages.create({
      body: `Hey ${username}, I’m Six, your AI matchmaker!! Save my number — you’ll be hearing from me soon 🎉`,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`SMS sent to ${formattedPhone}, SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

function formatPhoneNumber(phoneNumber) {
  let cleaned = phoneNumber.replace(/\D/g, '');
  // If it's a local 10-digit number, add default country code
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  // Return in E.164 format
  return '+' + cleaned;
}

async function pollFollowRequests() {
  setInterval(async () => {
    console.log('Polling for follow request acceptance...');

    try {
      // Get all users with pending follow requests from PostgreSQL
      const pendingUsers = await User.findAll({ 
        where: { 
          followRequestSent: true, 
          followRequestAccepted: false,
          smsSent: false
        }
      });
      
      for (const user of pendingUsers) {
        const username = user.instagram;
        
        if (username) {
          try {
            await initializeBrowser();
            
            // Check if the follow request was accepted
            const accepted = await checkFollowRequestAccepted(username);
            
            if (accepted) {
              console.log(`Follow request accepted by ${username}!`);
              
              // Send SMS notification
              try {
                console.log(`Sending SMS to ${user.phoneNumber}...`);
                await sendSMS(user.phoneNumber, user.firstName || username);
                console.log(`SMS successfully sent to ${user.phoneNumber}`);
                
                // Update user in PostgreSQL
                await User.update(
                  { followRequestAccepted: true, smsSent: true },
                  { where: { instagram: username } }
                );
              } catch (error) {
                console.error('SMS failed:', error.message);
              }
            }
          } catch (error) {
            console.error(`Error checking follow status for ${username}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error in polling:', error);
    }
  }, 60000); // Check every minute
}

// Start polling for follow requests
pollFollowRequests();

app.post('/api/follow', async (req, res) => {
  const { targetUsername, name, phoneNumber, gender, age, preference, lookingFor } = req.body;

  if (!targetUsername) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Clean the username (remove @ if present)
  const cleanUsername = targetUsername.replace('@', '');

  try {
    await initializeBrowser();

    // Store user information in PostgreSQL
    const userData = {
      firstName: name,
      phoneNumber,
      gender,
      age,
      instagram: cleanUsername,
      preference: preference || '',
      lookingFor: lookingFor || '',
      followRequestSent: false
    };
    
    // Check if user already exists
    let user = await User.findOne({ where: { instagram: cleanUsername } });
    
    if (user) {
      // Update existing user
      await User.update(
        userData,
        { where: { instagram: cleanUsername } }
      );
      // Get the updated user
      user = await User.findOne({ where: { instagram: cleanUsername } });
      console.log('Updated existing user in PostgreSQL:', user.instagram);
    } else {
      // Create new user
      user = await User.create(userData);
      console.log('Created new user in PostgreSQL:', user.instagram);
    }

    // Try to follow the user
    const success = await followUser(cleanUsername);
    
    // Update follow request status in database
    if (success) {
      await User.update(
        { followRequestSent: true },
        { where: { instagram: cleanUsername } }
      );
      console.log('Updated followRequestSent status for user:', cleanUsername);
    }

    if (success) {
      // Send SMS via Twilio
      await sendSMS(phoneNumber, name || cleanUsername);
      
      res.json({ 
        success: true, 
        message: `Successfully sent follow request to ${cleanUsername}. We'll notify you when they accept.` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: `Failed to follow ${cleanUsername}` 
      });
    }

  } catch (error) {
    console.error('Error:', error);
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
    res.status(500).json({ 
      error: error.message || 'An error occurred while processing your request. Please try again.' 
    });
  }
});

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
