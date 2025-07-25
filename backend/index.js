const express = require('express');
const multer = require('multer');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Process menu endpoint
app.post('/api/process-menu', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { openaiKey } = req.body;
    if (!openaiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    // Initialize OpenAI with the provided key
    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    // Convert image to base64
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log('Processing menu image...');

    // Step 1: Extract menu items from the image using GPT-4 Vision
    const menuExtraction = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this menu image and extract all the dish names. Return a JSON array of objects with the following structure:
              [
                {
                  "name": "dish name",
                  "description": "brief description if available, otherwise create a appealing description"
                }
              ]
              
              Only return the JSON array, no other text.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    let menuItems;
    try {
      const menuContent = menuExtraction.choices[0].message.content;
      console.log('Menu extraction result:', menuContent);
      
      // Clean the response to extract JSON
      const jsonMatch = menuContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        menuItems = JSON.parse(jsonMatch[0]);
      } else {
        menuItems = JSON.parse(menuContent);
      }
    } catch (parseError) {
      console.error('Error parsing menu items:', parseError);
      return res.status(500).json({ error: 'Failed to parse menu items' });
    }

    console.log(`Extracted ${menuItems.length} menu items`);

    // Step 2: Generate images for each dish
    const menuItemsWithImages = await Promise.all(
      menuItems.slice(0, 6).map(async (item, index) => { // Limit to 6 items to avoid token limits
        try {
          console.log(`Generating image for: ${item.name}`);
          
          const imagePrompt = `A professional, mouth-watering food photography of ${item.name}. ${item.description}. The dish should be beautifully plated on a clean white plate, with perfect lighting, restaurant-quality presentation, high resolution, appetizing, and visually stunning.`;
          
          const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            size: "1024x1024",
            quality: "standard",
            n: 1,
          });

          return {
            ...item,
            imageUrl: imageResponse.data[0].url
          };
        } catch (imageError) {
          console.error(`Error generating image for ${item.name}:`, imageError);
          return {
            ...item,
            imageUrl: 'https://via.placeholder.com/300x200?text=Image+Not+Available'
          };
        }
      })
    );

    console.log('Successfully processed menu');
    res.json({ menuItems: menuItemsWithImages });

  } catch (error) {
    console.error('Error processing menu:', error);
    res.status(500).json({ 
      error: 'Failed to process menu',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
