import { promises as fs } from "fs";
import * as path from "path";
import * as glob from "glob";
import { spawnOrFail } from "../utils/cmd-utils";
import { installCodegenDeps, runCodegenSync } from "../utils/codegen";
import {
  deleteGlob, // May be used later
  generateHomePage, // May be used later
  generateWelcomePage, // May be used later
  getPlasmicConfig,
} from "../utils/file-utils";
import { installUpgrade } from "../utils/npm-utils"; // May be used later
import { CPAStrategy, CreateArgs, InstallArgs, ConfigArgs, GenerateFilesArgs, BuildArgs } from "../utils/strategy";

export const sveltekitStrategy: CPAStrategy = {
  create: async (args: CreateArgs) => {
    const { projectPath } = args;
    const fullProjectPath = path.isAbsolute(projectPath)
      ? projectPath
      : path.resolve(process.cwd(), projectPath);

    const parentDir = path.dirname(fullProjectPath);
    const projectName = path.basename(fullProjectPath);

    await fs.mkdir(parentDir, { recursive: true });
    const prevDir = process.cwd();
    process.chdir(parentDir);

    try {
      const createCommand = `npm create svelte@latest ${projectName} -- --template skeleton --types typescript`;
      await spawnOrFail(createCommand);
    } catch (error) {
      console.error(`Failed to scaffold SvelteKit project at ${fullProjectPath}.`, error);
      const potentiallyCreatedProjectPath = path.join(parentDir, projectName);
      try {
        if (await fs.stat(potentiallyCreatedProjectPath).then(() => true).catch(() => false)) {
          await fs.rm(potentiallyCreatedProjectPath, { recursive: true, force: true });
          console.log(`Cleaned up directory: ${potentiallyCreatedProjectPath}`);
        }
      } catch (cleanupError) {
        console.error(`Failed to cleanup directory ${potentiallyCreatedProjectPath}:`, cleanupError);
      }
      throw error;
    } finally {
      process.chdir(prevDir);
    }
  },
  installDeps: async (args: InstallArgs) => {
    const { scheme, projectPath } = args;
    if (scheme === "loader") {
      throw new Error(
        "Plasmic loader scheme is not supported for SvelteKit. Please use the codegen scheme instead."
      );
    } else {
      return await installCodegenDeps({ projectPath });
    }
  },
  overwriteConfig: async (args: ConfigArgs) => {
    const { projectPath } = args;

    const tsConfigJsonPath = path.join(projectPath, "tsconfig.json");
    try {
      let tsConfigJsonStr = await fs.readFile(tsConfigJsonPath, "utf8");
      tsConfigJsonStr = tsConfigJsonStr.replace(/\/\*[\s\S]*?\*\//g, "");
      tsConfigJsonStr = tsConfigJsonStr.replace(/\/\/.*$/gm, "");
      const tsConfig = JSON.parse(tsConfigJsonStr);
      tsConfig.compilerOptions = {
        ...tsConfig.compilerOptions,
        noUnusedLocals: false,
        skipLibCheck: true,
      };
      await fs.writeFile(tsConfigJsonPath, JSON.stringify(tsConfig, null, 2));
      console.log(`Modified ${tsConfigJsonPath} to set noUnusedLocals=false and skipLibCheck=true.`);
    } catch (e) {
      console.warn(`WARN: Failed to modify ${tsConfigJsonPath}. Error: ${(e as Error).message}. Please ensure 'compilerOptions.noUnusedLocals' is false and 'compilerOptions.skipLibCheck' is true in your tsconfig.json for optimal Plasmic integration.`);
    }

    const viteConfigPath = path.join(projectPath, "vite.config.ts");
    try {
      let viteConfigStr = await fs.readFile(viteConfigPath, "utf8");
      const optimizeDepsConfig = `
  optimizeDeps: {
    include: ['@plasmicapp/react-web', '@plasmicapp/react-web/skinny', 'react', 'react-dom'],
  },`;
      const defineConfigRegex = /(defineConfig\(\s*{\s*)/;
      if (defineConfigRegex.test(viteConfigStr)) {
        if (!viteConfigStr.includes("optimizeDeps:")) {
             viteConfigStr = viteConfigStr.replace(defineConfigRegex, `$1${optimizeDepsConfig}`);
             await fs.writeFile(viteConfigPath, viteConfigStr);
             console.log(`Modified ${viteConfigPath} to include optimizeDeps for Plasmic.`);
        } else {
            console.log(`${viteConfigPath} already seems to have an optimizeDeps block. Skipping modification.`);
        }
      } else {
        console.warn(`WARN: Could not find 'defineConfig({' in ${viteConfigPath}. Skipping automatic addition of optimizeDeps. You may need to manually add '@plasmicapp/react-web', '@plasmicapp/react-web/skinny', 'react', and 'react-dom' to 'optimizeDeps.include' in your Vite configuration.`);
      }
    } catch (e) {
      console.warn(`WARN: Failed to modify ${viteConfigPath}. Error: ${(e as Error).message}. Ensure Vite is configured to optimize '@plasmicapp/react-web', '@plasmicapp/react-web/skinny', 'react', and 'react-dom'.`);
    }
  },
  generateFiles: async (args: GenerateFilesArgs) => {
    const { projectPath, scheme, projectId, projectApiToken } = args;
    const jsOrTs = 'ts'; // SvelteKit strategy defaults to TypeScript

    if (scheme === 'loader') {
      throw new Error("SvelteKit does not support loader mode. Use codegen.");
    }

    await runCodegenSync({ projectId, projectApiToken, projectPath });

    const plasmicHostSvelteContent = `
<script lang="ts">
  import { onMount } from 'svelte';
  // The purpose of this import is to ensure react-web's host is loaded and Vite processes it.
  import { sostenibilidad } from '@plasmicapp/react-web/lib/host';

  onMount(() => {
    if (sostenibilidad) {
      console.log('Plasmic host utilities loaded for SvelteKit.');
    }
  });
</script>

<div data-plasmic-sveltekit-host style="display: none;">
  Plasmic SvelteKit Host. Learn more at https://docs.plasmic.app/learn/app-hosting/
</div>

<style>
  /* Global styles should be carefully managed to avoid conflicts with Plasmic Studio. */
</style>
`;

    const rootLayoutSvelteContent = (lang: string) => `
<script lang="${lang}">
  // This is your root layout. You can add global providers here if needed.
  // For example, if using Plasmic's global variants context:
  // import { PlasmicRootProvider } from "@plasmicapp/react-web";
</script>

<!-- All pages will be rendered within this slot -->
<slot />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  }
</style>
`;

    const rootPageSvelteContent = (lang: string, mainComponentName: string, mainComponentPath: string) => `
<script lang="${lang}">
  import ${mainComponentName} from "${mainComponentPath}";
  // If you need to pass props from Svelte's load function:
  // export let data;
</script>

<${mainComponentName} />
`;

    const welcomePageSvelteContent = (lang: string) => `
<script lang="${lang}">
  // src/routes/+page.svelte
</script>

<div style="padding: 40px; text-align: center; line-height: 1.6;">
  <h1>Welcome to your SvelteKit + Plasmic App!</h1>
  <p>Your Plasmic host page is set up at <code>/plasmic-host</code>.</p>
  <p>Next steps:</p>
  <ol style="text-align: left; display: inline-block;">
    <li>Run this development server (usually <code>npm run dev</code>).</li>
    <li>Open Plasmic Studio and connect to this SvelteKit host.</li>
    <li>Create a new page in Studio (e.g., "Homepage") or sync an existing one.</li>
    <li>The generated components will appear in <code>src/components/plasmic</code>.</li>
    <li>This welcome page will be replaced by your "Homepage" (or similar) if found.</li>
  </ol>
  <p>Edit this welcome message in <code>packages/create-plasmic-app/src/sveltekit/sveltekit.ts</code> (if you need to regenerate it) or directly in <code>src/routes/+page.svelte</code>.</p>
</div>
`;

    const routesDir = path.join(projectPath, "src", "routes");
    const plasmicHostDir = path.join(routesDir, "plasmic-host");
    const plasmicHostFile = path.join(plasmicHostDir, "+page.svelte");
    const layoutFile = path.join(routesDir, "+layout.svelte");
    const rootPageFile = path.join(routesDir, "+page.svelte");

    await fs.mkdir(plasmicHostDir, { recursive: true });
    await fs.writeFile(plasmicHostFile, plasmicHostSvelteContent.trim());
    console.log(`Created Plasmic host file at ${plasmicHostFile}`);

    await fs.writeFile(layoutFile, rootLayoutSvelteContent(jsOrTs).trim());
    console.log(`Created root layout file at ${layoutFile}`);

    let mainPageContent = welcomePageSvelteContent(jsOrTs).trim();
    try {
      const config = await getPlasmicConfig(projectPath, "react", scheme); // Use 'react' as platform for config parsing
      const srcDir = path.join(projectPath, config.srcDir);
      const plasmicComponentsDir = path.join(srcDir, config.componentsDir ?? "components", "plasmic");

      const normalizedPlasmicComponentsDir = plasmicComponentsDir.replace(/\\/g, '/');
      const homeFilePattern = path.join(normalizedPlasmicComponentsDir, "@(Index|Home|home|Homepage).@(ts|tsx)").replace(/\\/g, '/');
      const homeFilePossibilities = glob.sync(homeFilePattern);

      if (homeFilePossibilities.length > 0) {
        const homeFilePath = homeFilePossibilities[0];
        const componentName = path.basename(homeFilePath).replace(/\.(ts|tsx)$/, "");
        let relativePath = path.relative(routesDir, homeFilePath).replace(/\\/g, '/');
        relativePath = relativePath.replace(/\.(ts|tsx)$/, "");
        if (!relativePath.startsWith(".") && !path.isAbsolute(relativePath)) {
            relativePath = "./" + relativePath;
        }

        mainPageContent = rootPageSvelteContent(jsOrTs, componentName, relativePath).trim();
        console.log(`Found Plasmic page ${componentName} at ${homeFilePath}, using it as root page.`);
      } else {
        console.log(`No default Plasmic page (Index, Home, Homepage) found in ${plasmicComponentsDir}. Using welcome page.`);
      }
    } catch (err) {
      console.warn(`Error finding default Plasmic page, using welcome page. Details: ${(err as Error).message}`);
    }

    await fs.writeFile(rootPageFile, mainPageContent);
    console.log(`Created root page file at ${rootPageFile}`);
  },
  build: async (args: BuildArgs) => {
    const { npmRunCmd, projectPath } = args;
    // SvelteKit projects typically use 'build' as their build script in package.json
    // spawnOrFail treats the second string argument as cwd if present.
    await spawnOrFail(`${npmRunCmd} build`, projectPath);
    console.log(`SvelteKit project build command executed successfully in ${projectPath}.`);
  },
};
