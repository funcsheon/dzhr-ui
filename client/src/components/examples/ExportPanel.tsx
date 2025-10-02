import { ExportPanel } from '../ExportPanel';

export default function ExportPanelExample() {
  const handleExportFigma = () => console.log('Exporting to Figma...');
  const handleExportImage = () => console.log('Exporting as image...');
  const handleExportCode = () => console.log('Exporting code...');

  return (
    <ExportPanel
      onExportFigma={handleExportFigma}
      onExportImage={handleExportImage}
      onExportCode={handleExportCode}
    />
  );
}
