import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { execSync } from 'child_process';

function getChromiumPath(): string | undefined {
  try {
    const path = execSync('which chromium', { encoding: 'utf-8' }).trim();
    return path || undefined;
  } catch {
    return undefined;
  }
}

export async function scrapeWebsiteStyles(url: string) {
  let browser;
  
  try {
    const chromiumPath = getChromiumPath();
    browser = await puppeteer.launch({
      headless: true,
      ...(chromiumPath && { executablePath: chromiumPath }),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const styles = await page.evaluate(() => {
      const colors = new Set<string>();
      const fonts = new Set<string>();
      
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        
        const bgColor = computed.backgroundColor;
        const textColor = computed.color;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          colors.add(bgColor);
        }
        if (textColor) {
          colors.add(textColor);
        }
        
        const fontFamily = computed.fontFamily;
        if (fontFamily) {
          fonts.add(fontFamily.split(',')[0].replace(/['"]/g, '').trim());
        }
      });

      return {
        colors: Array.from(colors).slice(0, 10),
        fonts: Array.from(fonts).slice(0, 5),
      };
    });

    const html = await page.content();
    const $ = cheerio.load(html);
    
    const layouts = new Set<string>();
    $('*').each((_, el) => {
      const display = $(el).css('display');
      if (display === 'grid') layouts.add('Grid');
      if (display === 'flex') layouts.add('Flexbox');
    });

    await browser.close();

    return {
      colors: styles.colors,
      fonts: styles.fonts,
      spacing: ['16px', '24px', '32px', '48px'],
      layouts: Array.from(layouts),
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function scrapeDesignSystem(url: string) {
  let browser;
  
  try {
    const chromiumPath = getChromiumPath();
    browser = await puppeteer.launch({
      headless: true,
      ...(chromiumPath && { executablePath: chromiumPath }),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const html = await page.content();
    const $ = cheerio.load(html);
    
    const components = new Set<string>();
    const colorTokens = new Set<string>();
    
    $('h1, h2, h3, h4').each((_, el) => {
      const text = $(el).text().toLowerCase();
      if (text.includes('button')) components.add('Button');
      if (text.includes('card')) components.add('Card');
      if (text.includes('input')) components.add('Input');
      if (text.includes('modal')) components.add('Modal');
      if (text.includes('dropdown')) components.add('Dropdown');
      if (text.includes('table')) components.add('Table');
      if (text.includes('form')) components.add('Form');
    });

    $('[class*="color"], [class*="palette"]').each((_, el) => {
      const bgColor = $(el).css('background-color');
      if (bgColor && bgColor !== 'transparent') {
        colorTokens.add(bgColor);
      }
    });

    await browser.close();

    return {
      components: Array.from(components),
      colors: Array.from(colorTokens).slice(0, 10),
      typography: ['heading-1', 'heading-2', 'body', 'caption'],
      spacing: ['xs', 'sm', 'md', 'lg', 'xl'],
      principles: ['Consistency', 'Clarity', 'Accessibility'],
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`Failed to scrape design system: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
