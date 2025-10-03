import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import multer from "multer";
import { scrapeWebsiteStyles, scrapeDesignSystem } from "./lib/scraper";
import { analyzeWebsiteTemplate, analyzeDesignSystem, generateDesign } from "./lib/openai";
import { deviceTypes, insertDesignSystemSchema } from "@shared/schema";
import { storage } from "./storage";
import { parseCodeFile } from "./lib/codeParser";
import { getFigmaComponents, getFigmaStyles, listMcpTools } from "./lib/figmaMcp";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/design-systems", async (_req, res) => {
    try {
      const systems = await storage.getAllDesignSystems();
      res.json(systems);
    } catch (error) {
      console.error('Get design systems error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get design systems' 
      });
    }
  });

  app.post("/api/design-systems", async (req, res) => {
    try {
      const data = insertDesignSystemSchema.parse(req.body);
      
      const existing = await storage.getDesignSystemByName(data.name);
      if (existing) {
        return res.status(400).json({ error: 'Design system with this name already exists' });
      }
      
      const designSystem = await storage.createDesignSystem(data);
      res.json(designSystem);
    } catch (error) {
      console.error('Create design system error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create design system' 
      });
    }
  });

  app.patch("/api/design-systems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = z.object({
        name: z.string().optional(),
        components: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
        sourceUrl: z.string().optional(),
      }).parse(req.body);

      const designSystem = await storage.updateDesignSystem(id, updates);
      if (!designSystem) {
        return res.status(404).json({ error: 'Design system not found' });
      }

      res.json(designSystem);
    } catch (error) {
      console.error('Update design system error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to update design system' 
      });
    }
  });

  app.delete("/api/design-systems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteDesignSystem(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Design system not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete design system error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to delete design system' 
      });
    }
  });

  app.get("/api/prompt-history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const prompts = await storage.getRecentPrompts(limit);
      res.json(prompts);
    } catch (error) {
      console.error('Get prompt history error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get prompt history' 
      });
    }
  });

  app.post("/api/prompt-history", async (req, res) => {
    try {
      const { prompt } = z.object({ prompt: z.string().min(1) }).parse(req.body);
      const savedPrompt = await storage.savePrompt({ prompt });
      res.json(savedPrompt);
    } catch (error) {
      console.error('Save prompt error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input data',
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to save prompt' 
      });
    }
  });

  app.post("/api/parse-code-file", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const content = req.file.buffer.toString('utf-8');
      const filename = req.file.originalname;
      
      const components = parseCodeFile(content, filename);
      
      res.json({ components });
    } catch (error) {
      console.error('Parse code file error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to parse code file' 
      });
    }
  });
  
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

  app.post("/api/refine-designs", async (req, res) => {
    try {
      const schema = z.object({
        currentDesigns: z.array(z.object({
          device: z.string(),
          html: z.string(),
          css: z.string(),
        })),
        refinementPrompt: z.string().min(1),
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
      
      const { refineDesign } = await import('./lib/openai.js');
      
      const designs = await Promise.all(
        data.currentDesigns.map(async (currentDesign) => {
          const device = deviceTypes.find(d => d.id === currentDesign.device);
          if (!device) {
            throw new Error(`Invalid device: ${currentDesign.device}`);
          }

          return refineDesign({
            currentHtml: currentDesign.html,
            currentCss: currentDesign.css,
            refinementPrompt: data.refinementPrompt,
            device,
            designSystemUrl: data.designSystemUrl,
            designSystemComponents: data.designSystemComponents,
            templateStyles: data.templateStyles,
          });
        })
      );

      res.json({ designs });
    } catch (error) {
      console.error('Design refinement error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to refine designs' 
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
      res.setHeader('Content-Disposition', `attachment; filename="${data.projectName}.fig"`);
      res.json(figmaData);
    } catch (error) {
      console.error('Figma export error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to export to Figma' 
      });
    }
  });

  app.post("/api/figma/analyze", async (req, res) => {
    try {
      const schema = z.object({
        fileKey: z.string(),
      });

      const { fileKey } = schema.parse(req.body);
      
      const [componentsResult, stylesResult] = await Promise.all([
        getFigmaComponents(fileKey),
        getFigmaStyles(fileKey),
      ]);

      const extractedComponents: { name: string; url: string }[] = [];
      
      if (componentsResult && typeof componentsResult === 'object' && 'content' in componentsResult) {
        const content = Array.isArray(componentsResult.content) 
          ? componentsResult.content 
          : [componentsResult.content];
        
        content.forEach((item: any) => {
          let dataToProcess: any = null;
          
          if (item.type === 'application/json' || item.type === 'json') {
            dataToProcess = item.json || item.data;
          } else if (item.type === 'text' && item.text) {
            try {
              dataToProcess = JSON.parse(item.text);
            } catch {
              const componentMatches = item.text.matchAll(/(?:Component|component):\s*([^\n,]+)/g);
              for (const match of componentMatches) {
                extractedComponents.push({
                  name: match[1].trim(),
                  url: `https://figma.com/file/${fileKey}`,
                });
              }
            }
          }
          
          if (dataToProcess) {
            if (Array.isArray(dataToProcess)) {
              dataToProcess.forEach((comp: any) => {
                if (comp.name) {
                  extractedComponents.push({
                    name: comp.name,
                    url: comp.figma_url || `https://figma.com/file/${fileKey}`,
                  });
                }
              });
            } else if (dataToProcess.components && Array.isArray(dataToProcess.components)) {
              dataToProcess.components.forEach((comp: any) => {
                if (comp.name) {
                  extractedComponents.push({
                    name: comp.name,
                    url: comp.figma_url || `https://figma.com/file/${fileKey}`,
                  });
                }
              });
            } else if (dataToProcess.name) {
              extractedComponents.push({
                name: dataToProcess.name,
                url: dataToProcess.figma_url || `https://figma.com/file/${fileKey}`,
              });
            }
          }
        });
      }

      res.json({
        components: extractedComponents,
        styles: stylesResult,
      });
    } catch (error) {
      console.error('Figma MCP analysis error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to analyze Figma file' 
      });
    }
  });

  app.get("/api/figma/mcp-tools", async (_req, res) => {
    try {
      const tools = await listMcpTools();
      res.json(tools);
    } catch (error) {
      console.error('MCP tools listing error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to list MCP tools' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
