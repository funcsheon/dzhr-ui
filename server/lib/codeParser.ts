export interface ParsedComponent {
  name: string;
  type: string;
  url: string;
}

export function parseCodeFile(content: string, filename: string): ParsedComponent[] {
  const components: ParsedComponent[] = [];
  const extension = filename.split('.').pop()?.toLowerCase();

  if (extension === 'css' || extension === 'scss' || extension === 'less') {
    components.push(...parseCSSFile(content));
  } else if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) {
    components.push(...parseJavaScriptFile(content));
  } else if (extension === 'json') {
    components.push(...parseJSONFile(content));
  }

  return components;
}

function parseCSSFile(content: string): ParsedComponent[] {
  const components: ParsedComponent[] = [];
  
  const classPattern = /\.([a-zA-Z][a-zA-Z0-9-_]*)/g;
  const matches = content.matchAll(classPattern);
  const classNames = new Set<string>();
  
  for (const match of matches) {
    const className = match[1];
    if (isComponentClassName(className)) {
      classNames.add(className);
    }
  }

  classNames.forEach(name => {
    components.push({
      name: formatComponentName(name),
      type: 'CSS Component',
      url: '',
    });
  });

  return components;
}

function parseJavaScriptFile(content: string): ParsedComponent[] {
  const components: ParsedComponent[] = [];
  
  const functionPattern = /(?:function|const|let|var)\s+([A-Z][a-zA-Z0-9]*)\s*[=\(]/g;
  const classPattern = /class\s+([A-Z][a-zA-Z0-9]*)/g;
  const exportPattern = /export\s+(?:default\s+)?(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g;
  
  const patterns = [functionPattern, classPattern, exportPattern];
  const componentNames = new Set<string>();

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const name = match[1];
      if (name && name[0] === name[0].toUpperCase()) {
        componentNames.add(name);
      }
    }
  });

  componentNames.forEach(name => {
    components.push({
      name,
      type: 'React Component',
      url: '',
    });
  });

  return components;
}

function parseJSONFile(content: string): ParsedComponent[] {
  const components: ParsedComponent[] = [];
  
  try {
    const data = JSON.parse(content);
    
    if (data.components && Array.isArray(data.components)) {
      return data.components.map((comp: any) => ({
        name: comp.name || comp.id || 'Unknown',
        type: comp.type || 'Component',
        url: comp.url || '',
      }));
    }
    
    if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        if (key.match(/^[A-Z]/)) {
          components.push({
            name: key,
            type: 'JSON Component',
            url: '',
          });
        }
      });
    }
  } catch (error) {
    console.error('Failed to parse JSON:', error);
  }

  return components;
}

function isComponentClassName(className: string): boolean {
  const componentPrefixes = ['btn', 'card', 'modal', 'input', 'select', 'dropdown', 'nav', 'menu', 'alert', 'badge', 'chip', 'tab', 'accordion', 'form', 'table', 'list'];
  return componentPrefixes.some(prefix => className.toLowerCase().startsWith(prefix));
}

function formatComponentName(className: string): string {
  return className
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
