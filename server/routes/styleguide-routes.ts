import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { minimalisticTemplate } from "../../shared/templates/template-minimalistic";

export function registerStyleguideRoutes(app: Express) {
  // Get user's styleguide - DEMO VERSION with mock data
  app.get("/api/styleguide/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Return demo styleguide for testing
      if (userId === "demo123") {
        const demoStyleguide = {
          id: 1,
          userId: "demo123",
          templateId: "minimalistic",
          title: "Sarah Johnson",
          subtitle: "Strategic Brand Consultant",
          personalMission: "Empowering women entrepreneurs to build authentic, profitable brands that reflect their true essence and create meaningful impact in the world.",
          brandVoice: "Warm, professional, and inspiring with an authentic, conversational tone that makes complex business concepts feel accessible and achievable.",
          targetAudience: "Ambitious women entrepreneurs ready to elevate their brand and scale their business with authentic, strategic positioning.",
          visualStyle: "Refined minimal with editorial sophistication",
          colorPalette: {
            primary: "#1a1a1a",
            secondary: "#666666",
            accent: "#f8f8f8",
            text: "#1a1a1a",
            background: "#fefefe",
            border: "#f0f0f0"
          },
          typography: {
            headline: "Helvetica Neue, sans-serif",
            subheading: "Helvetica Neue, sans-serif", 
            body: "Helvetica Neue, sans-serif",
            accent: "Helvetica Neue, sans-serif"
          },
          imageSelections: {
            heroImage: "https://i.postimg.cc/VLCFmXVr/1.png",
            portraitImages: [
              "https://i.postimg.cc/VLCFmXVr/1.png",
              "https://i.postimg.cc/WpDyqFyj/10.png",
              "https://i.postimg.cc/SRz1B3Hk/11.png"
            ],
            lifestyleImages: [
              "https://i.postimg.cc/VLCFmXVr/1.png",
              "https://i.postimg.cc/WpDyqFyj/10.png",
              "https://i.postimg.cc/SRz1B3Hk/11.png",
              "https://i.postimg.cc/VLCFmXVr/1.png"
            ]
          },
          brandPersonality: {
            traits: ["Authentic", "Professional", "Inspiring", "Strategic", "Warm", "Confident"],
            keywords: ["Authentic", "Strategic", "Inspiring"],
            vibe: "Refined Minimal Professional"
          },
          businessApplications: {
            primaryService: "Strategic Brand Consulting",
            priceRange: "Premium Investment",
            clientExperience: "Transformational & Personal"
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return res.json(demoStyleguide);
      }
      
      res.status(404).json({ message: "Styleguide not found" });
    } catch (error) {
      console.error("Error fetching styleguide:", error);
      res.status(500).json({ message: "Failed to fetch styleguide" });
    }
  });

  // Create or update user's styleguide (SANDRA AI endpoint)
  app.post("/api/styleguide", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const styleguideData = req.body;
      const styleguide = await storage.createOrUpdateStyleguide(userId, styleguideData);
      
      res.json(styleguide);
    } catch (error) {
      console.error("Error creating styleguide:", error);
      res.status(500).json({ message: "Failed to create styleguide" });
    }
  });

  // Get styleguide templates for SANDRA AI
  app.get("/api/styleguide-templates", async (req, res) => {
    try {
      const templates = [
        minimalisticTemplate
        // Add more templates as they are implemented
      ];
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // SANDRA AI Chat endpoint for styleguide creation
  app.post("/api/styleguide-chat", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { message, currentStyleguide } = req.body;
      
      // Get user's complete context for SANDRA AI
      const onboardingData = await storage.getOnboardingData(userId);
      
      // Generate response using minimalistic template
      const response = generateSandraStyleguideResponse({
        message,
        userId,
        onboardingData,
        currentStyleguide,
        availableTemplates: [minimalisticTemplate]
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error in SANDRA styleguide chat:", error);
      res.status(500).json({ message: "Failed to process styleguide request" });
    }
  });
}

// SANDRA AI generates personalized styleguide responses
function generateSandraStyleguideResponse(context: any) {
  const { message, onboardingData, currentStyleguide, availableTemplates } = context;
  
  // Simple template matching based on user message
  const isCreationRequest = message.toLowerCase().includes('create') || 
                           message.toLowerCase().includes('new') || 
                           message.toLowerCase().includes('generate');
  
  if (isCreationRequest) {
    // Use minimalistic template as default
    const template = availableTemplates[0];
    
    return {
      type: 'styleguide_created',
      message: `I've created a beautiful "${template.name}" styleguide for you! This template features ${template.description.toLowerCase()}. It uses ${template.typography.headline} typography and a sophisticated color palette with ${template.colors.primary} as the primary color. Perfect for your brand personality!`,
      styleguideData: {
        templateId: template.id,
        templateName: template.name,
        colors: template.colors,
        typography: template.typography,
        voiceProfile: template.voiceProfile,
        visualElements: template.visualElements,
        // Integrate user data
        personalMission: onboardingData?.personalMission || "Your unique mission and vision",
        brandVoice: onboardingData?.brandVoice || "Professional and authentic",
        targetAudience: onboardingData?.targetAudience || "Your ideal clients"
      },
      templateApplied: template.id
    };
  }
  
  return {
    type: 'conversation',
    message: `I'd love to help you create your personalized styleguide! I can create a beautiful brand bible using your AI images, personal story, and preferences. Just say "create my styleguide" and I'll get started!`,
    suggestions: [
      "Create my styleguide",
      "Show me templates",
      "What information do you need?"
    ]
  };
}