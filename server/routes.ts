import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { scrapeWebsiteStyles, scrapeDesignSystem } from "./lib/scraper";
import { analyzeWebsiteTemplate, analyzeDesignSystem, generateDesign } from "./lib/openai";
import { deviceTypes } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/analyze-template", async (req, res) => {
    try {
      const { url } = z.object({ url: z.string().min(1) }).parse(req.body);
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }
      
      const scrapedStyles = await scrapeWebsiteStyles(url);
      
      let aiAnalysis = { colors: [], fonts: [], spacing: [], layouts: [] };
      try {
        aiAnalysis = await analyzeWebsiteTemplate(url);
      } catch (aiError) {
        console.log('AI analysis unavailable, using scraped data only:', aiError instanceof Error ? aiError.message : 'Unknown error');
      }
      
      const colorSet = new Set([...(scrapedStyles.colors || []), ...(aiAnalysis.colors || [])]);
      const fontSet = new Set([...(scrapedStyles.fonts || []), ...(aiAnalysis.fonts || [])]);
      const layoutSet = new Set([...(scrapedStyles.layouts || []), ...(aiAnalysis.layouts || [])]);
      
      const mergedStyles = {
        colors: Array.from(colorSet).slice(0, 10),
        fonts: Array.from(fontSet).slice(0, 5),
        spacing: aiAnalysis.spacing || scrapedStyles.spacing || [],
        layouts: Array.from(layoutSet),
      };

      res.json(mergedStyles);
    } catch (error) {
      console.error('Template analysis error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to analyze template' 
      });
    }
  });

  app.post("/api/analyze-design-system", async (req, res) => {
    try {
      const { url } = z.object({ url: z.string().min(1) }).parse(req.body);
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }
      
      const scrapedData = await scrapeDesignSystem(url);
      
      let aiAnalysis = { components: [], colors: [], typography: [], spacing: [], principles: [] };
      try {
        aiAnalysis = await analyzeDesignSystem(url);
      } catch (aiError) {
        console.log('AI analysis unavailable, using scraped data only:', aiError instanceof Error ? aiError.message : 'Unknown error');
      }
      
      const componentSet = new Set([...(scrapedData.components || []), ...(aiAnalysis.components || [])]);
      const colorSet = new Set([...(scrapedData.colors || []), ...(aiAnalysis.colors || [])]);
      
      const mergedData = {
        components: Array.from(componentSet),
        colors: Array.from(colorSet).slice(0, 10),
        typography: aiAnalysis.typography || scrapedData.typography || [],
        spacing: aiAnalysis.spacing || scrapedData.spacing || [],
        principles: aiAnalysis.principles || scrapedData.principles || [],
      };

      res.json(mergedData);
    } catch (error) {
      console.error('Design system analysis error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to analyze design system' 
      });
    }
  });

  app.post("/api/generate-designs", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string().min(1),
        devices: z.array(z.string()),
        designSystemUrl: z.string().url().optional(),
        designSystemComponents: z.array(z.object({
          name: z.string(),
          url: z.string(),
        })).optional(),
        templateStyles: z.object({
          colors: z.array(z.string()).optional(),
          fonts: z.array(z.string()).optional(),
          spacing: z.array(z.string()).optional(),
          layouts: z.array(z.string()).optional(),
        }).optional(),
      });

      const data = schema.parse(req.body);
      
      const designs = await Promise.all(
        data.devices.map(async (deviceId) => {
          const device = deviceTypes.find(d => d.id === deviceId);
          if (!device) {
            throw new Error(`Invalid device: ${deviceId}`);
          }

          return generateDesign({
            prompt: data.prompt,
            device,
            designSystemUrl: data.designSystemUrl,
            designSystemComponents: data.designSystemComponents,
            templateStyles: data.templateStyles,
          });
        })
      );

      res.json({ designs });
    } catch (error) {
      console.error('Design generation error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to generate designs' 
      });
    }
  });

  app.post("/api/export-figma", async (req, res) => {
    try {
      const schema = z.object({
        designs: z.array(z.object({
          device: z.string(),
          html: z.string(),
          css: z.string(),
        })),
        projectName: z.string(),
      });

      const data = schema.parse(req.body);
      
      const figmaData = {
        name: data.projectName,
        version: "1.0.0",
        frames: data.designs.map(design => ({
          name: design.device,
          width: deviceTypes.find(d => d.id === design.device)?.width || 375,
          height: deviceTypes.find(d => d.id === design.device)?.height || 812,
          html: design.html,
          css: design.css,
        })),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${data.projectName}.fig.json"`);
      res.json(figmaData);
    } catch (error) {
      console.error('Figma export error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to export to Figma' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
