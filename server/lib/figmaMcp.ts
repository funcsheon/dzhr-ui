import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

let mcpClient: Client | null = null;

export async function initializeFigmaMcp() {
  if (mcpClient) {
    return mcpClient;
  }

  const figmaApiKey = process.env.FIGMA_API_KEY;
  if (!figmaApiKey) {
    throw new Error('FIGMA_API_KEY environment variable is not set');
  }

  try {
    const transport = new StdioClientTransport({
      command: "npx",
      args: [
        "-y",
        "figma-developer-mcp",
        `--figma-api-key=${figmaApiKey}`,
        "--stdio"
      ],
    });

    mcpClient = new Client(
      {
        name: "dzhr-ui-figma-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await mcpClient.connect(transport);
    console.log("Figma MCP server connected successfully");
    
    return mcpClient;
  } catch (error) {
    console.error("Failed to initialize Figma MCP:", error);
    throw error;
  }
}

export async function getFigmaFile(fileKey: string) {
  const client = await initializeFigmaMcp();
  
  try {
    const result = await client.callTool({
      name: "get_figma_file",
      arguments: {
        file_key: fileKey,
      },
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching Figma file:", error);
    throw error;
  }
}

export async function getFigmaComponents(fileKey: string) {
  const client = await initializeFigmaMcp();
  
  try {
    const result = await client.callTool({
      name: "get_components",
      arguments: {
        file_key: fileKey,
      },
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching Figma components:", error);
    throw error;
  }
}

export async function getFigmaStyles(fileKey: string) {
  const client = await initializeFigmaMcp();
  
  try {
    const result = await client.callTool({
      name: "get_styles",
      arguments: {
        file_key: fileKey,
      },
    });
    
    return result;
  } catch (error) {
    console.error("Error fetching Figma styles:", error);
    throw error;
  }
}

export async function listMcpTools() {
  const client = await initializeFigmaMcp();
  
  try {
    const tools = await client.listTools();
    return tools;
  } catch (error) {
    console.error("Error listing MCP tools:", error);
    throw error;
  }
}
