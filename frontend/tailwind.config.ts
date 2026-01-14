import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/app/**/*.{ts,tsx,mdx}",
        "./src/features/**/*.{ts,tsx,mdx}",
        "./src/shared/**/*.{ts,tsx,mdx}",
    ],
    plugins: [animate],
};

export default config;
