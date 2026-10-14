import JSZip from 'jszip';
import { PROJECT_FILES } from '../data/projectData';

export async function exportProjectAsZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('AI-Energy-Forecasting') || zip;

  // Add all project code files
  for (const file of PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Add dummy placeholder files for folders to maintain git structure
  rootFolder.file('outputs/README.txt', 'This folder stores generated visualization plots (actual_vs_predicted.png) and metrics.json.\n');
  rootFolder.file('models/README.txt', 'This folder stores trained joblib model binaries (energy_forecast_model.pkl, scaler.pkl).\n');

  // Generate binary zip
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'AI-Energy-Forecasting-Complete-Repo.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
