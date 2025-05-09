const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const path = require('path');

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  console.log('Loaded .env file in development mode');
}

const { User, PuppeteerCookies, syncDatabase } = require('./models/sequelize');
const notificationService = require('./services/notificationService');

const app = express();
const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = [
  'IG_USERNAME',
  'IG_PASSWORD',
  'DATABASE_URL',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHANNEL_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

const INSTAGRAM_USERNAME = process.env.IG_USERNAME;
const INSTAGRAM_PASSWORD = process.env.IG_PASSWORD;

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
    await PuppeteerCookies.create({ data: cookies });
    console.log('Cookies saved successfully to database');
  } catch (error) {
    console.error('Error saving cookies:', error);
  }
}

async function loadCookies(page) {
  try {
    const lastCookies = await PuppeteerCookies.findOne({
      order: [['updated_at', 'DESC']]
    });

    if (lastCookies) {
      await page.setCookie(...lastCookies.data);
      console.log('Cookies loaded successfully from database');
      return true;
    }
    console.log('No cookies found in database');
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
      timeout: 60000 
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
    
    // Navigate to Instagram login page
    await page.goto('https://www.instagram.com/accounts/login/', { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    
    // Wait for either the username input or the logged-in state
    try {
      await Promise.race([
        page.waitForSelector('input[name="username"]', { timeout: 30000 }),
        page.waitForSelector('nav[role="navigation"]', { timeout: 30000 }) // Logged in state
      ]);
    } catch (error) {
      console.error('Error waiting for login page elements:', error);
      // Take a screenshot for debugging
      if (process.env.NODE_ENV !== 'production') {
        await page.screenshot({ path: 'login-error.png' });
      }
      throw new Error('Could not find login form or logged-in state');
    }
    
    // Check if we're already logged in
    const isAlreadyLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('nav[role="navigation"]');
    });
    
    if (isAlreadyLoggedIn) {
      console.log('Already logged in!');
      return true;
    }
    
    console.log('Login form found, entering credentials...');
    
    // Clear any existing values
    await page.evaluate(() => {
      document.querySelector('input[name="username"]').value = '';
      document.querySelector('input[name="password"]').value = '';
    });
    
    // Type credentials with random delays
    await page.type('input[name="username"]', INSTAGRAM_USERNAME, { delay: Math.random() * 100 + 50 });
    await page.type('input[name="password"]', INSTAGRAM_PASSWORD, { delay: Math.random() * 100 + 50 });
    
    console.log('Submitting login form...');
    
    // Click the login button and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }),
      page.click('button[type="submit"]')
    ]);
    
    // Handle potential popups
    try {
      console.log('Checking for save login info popup...');
      const saveInfoButton = await page.waitForSelector('button._acan._acap._acas._aj1-', { timeout: 5000 });
      if (saveInfoButton) {
        await saveInfoButton.click();
        console.log('Handled save login info popup');
      }
    } catch (e) {
      console.log('No save login info popup found');
    }

    try {
      console.log('Checking for notifications popup...');
      const notificationButton = await page.waitForSelector('button._a9--._a9_1', { timeout: 5000 });
      if (notificationButton) {
        await notificationButton.click();
        console.log('Handled notifications popup');
      }
    } catch (e) {
      console.log('No notifications popup found');
    }

    // Verify login success
    const loggedIn = await isLoggedIn(page);
    if (loggedIn) {
      console.log('Login successful, saving cookies...');
      await saveCookies(page);
      return true;
    } else {
      console.log('Login verification failed');
      // Take a screenshot for debugging
      if (process.env.NODE_ENV !== 'production') {
        await page.screenshot({ path: 'login-failed.png' });
      }
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    // Take a screenshot for debugging
    if (process.env.NODE_ENV !== 'production') {
      await page.screenshot({ path: 'login-error.png' });
    }
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
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        ignoreHTTPSErrors: true
      });
      
      page = await browser.newPage();
      
      // Set a more realistic user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1280, height: 800 });
      
      // Set default timeout
      page.setDefaultTimeout(120000); // 2 minutes
      
      // Enable request interception
      await page.setRequestInterception(true);
      
      // Handle request interception
      page.on('request', (request) => {
        if (
          request.resourceType() === 'image' ||
          request.resourceType() === 'stylesheet' ||
          request.resourceType() === 'font'
        ) {
          request.abort();
        } else {
          request.continue();
        }
      });

      const cookiesLoaded = await loadCookies(page);
      let loggedIn = false;
      
      if (cookiesLoaded) {
        console.log('Checking if cookies are still valid...');
        loggedIn = await isLoggedIn(page);
        
        if (!loggedIn) {
          console.log('Cookies expired or invalid, performing fresh login...');
          await PuppeteerCookies.destroy({
            where: {},
            truncate: true
          });
          console.log('Deleted invalid cookies from database');
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
      timeout: 60000
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
      timeout: 60000
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
          followRequestAccepted: false
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
              
              // Update user in PostgreSQL
              await User.update(
                { followRequestAccepted: true },
                { where: { instagram: username } }
              );
              
              // Send notification for follow request accepted
              await notificationService.notifyFollowRequestUpdate(username, 'Request Accepted');
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

// Background processing function
async function processUserInBackground(userData) {
  try {
    const { targetUsername, name, phoneNumber, gender, age, preference, lookingFor } = userData;
    const cleanUsername = targetUsername.replace('@', '');

    // Initialize browser
    await initializeBrowser();

    // Store user information in PostgreSQL
    const userDataForDb = {
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
        userDataForDb,
        { where: { instagram: cleanUsername } }
      );
      user = await User.findOne({ where: { instagram: cleanUsername } });
      console.log('Updated existing user in PostgreSQL:', user.instagram);
      await notificationService.notifyNewUser(userDataForDb);
    } else {
      // Create new user
      user = await User.create(userDataForDb);
      console.log('Created new user in PostgreSQL:', user.instagram);
      await notificationService.notifyNewUser(userDataForDb);
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
      await notificationService.notifyFollowRequestUpdate(cleanUsername, 'Request Sent');
    }
  } catch (error) {
    console.error('Background processing error:', error);
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
  }
}

app.post('/api/follow', async (req, res) => {
  const userData = req.body;

  if (!userData.targetUsername) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Immediately respond to the client
  res.json({ 
    success: true, 
    message: 'Request received and being processed' 
  });

  // Process the request in the background
  processUserInBackground(userData).catch(error => {
    console.error('Background processing failed:', error);
  });
});

process.on('SIGINT', async () => {
  if (browser) {
    await browser.close();
  }
  process.exit();
});

// Initialize database and start server
syncDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize:', err);
    process.exit(1);
  });
