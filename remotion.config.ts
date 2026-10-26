import {Config} from '@remotion/cli/config';
import os from 'node:os';

Config.setOverwriteOutput(true);
Config.setConcurrency(Math.max(1, Math.min(4, os.cpus().length)));
if (process.env.CHROME_PATH) {
  Config.setBrowserExecutable(process.env.CHROME_PATH);
}
