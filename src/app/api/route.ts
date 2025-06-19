import fs from 'fs';
import os from 'os';
import path from 'path';
import process from 'process';
import { NextResponse } from 'next/server';
import { constants } from '@/shared/scripts/constants';

export const GET = async () => {
  try {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);

    const totalMem = os.totalmem() / (1024 * 1024 * 1024);
    const freeMem = os.freemem() / (1024 * 1024 * 1024);
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0];

    const getApiRoutes = (): string[] => {
      const apiDir = path.join(process.cwd(), `src`, `app`, `api`);
      let routes: string[] = [];

      const walk = (dir: string, baseRoute = ``) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            walk(fullPath, `${baseRoute}/${file}`);
          } else if (file.endsWith(`.ts`) || file.endsWith(`.js`)) {
            const srtRoute = `${baseRoute}/${file.replace(/\.ts$|\.js$/, ``)}`;
            const noIndexRoute = srtRoute.replaceAll(`index`, ``);
            const noidxrt = noIndexRoute;
            let apiRoute = noIndexRoute.replace(/^/, `/api${noidxrt == `` ? `` : ``}`);
            apiRoute = apiRoute?.replaceAll(`route`, ``);
            routes.push(apiRoute);
            routes?.sort();
          }
        });
      };

      walk(apiDir);
      return routes;
    };

    return NextResponse.json({
      ok: true,
      status: 200,
      success: true,
      statusText: `ok`,
      routes: getApiRoutes(),
      message: `API Server Connected`,
      A: constants?.titles?.extended,
      cpuLoad: `${cpuLoad.toFixed(2)}`,
      timestamp: new Date().toISOString(),
      uptime: `${uptimeHours} hours, ${uptimeMinutes} minutes`,
      memoryUsage: `${usedMem.toFixed(2)} GB of ${totalMem.toFixed(2)} GB`,
    });

  } catch (error) {
    return NextResponse.json({ error: `Server is in Error State` }, { status: 500 });
  }
};