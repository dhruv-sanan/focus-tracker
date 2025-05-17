// workbox-config.js
module.exports = {
	globDirectory: ".next",
	globPatterns: [
	  "**/*.{js,css,json,png,svg,html}"
	],
	// <— point to your custom sw.js source
	// <— where to write the final file
	swDest: "public/sw.js",
	// optional: tweak max size
	maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  }
  