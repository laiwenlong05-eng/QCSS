(function(global) {
    const QCSS = {
        manifest: {},

        /**
         * Initialize QCSS Runtime.
         * Loads the manifest and optionally hydrates the DOM.
         * @param {Object} manifest - The JSON mapping of paths to hashes.
         * @param {Boolean} hydrate - Whether to automatically apply q-id to DOM elements.
         */
        init: function(manifest, hydrate = true) {
            this.manifest = manifest || {};
            if (hydrate) {
                this.hydrate();
            }
        },

        /**
         * Scans the DOM for data-ref attributes and applies corresponding q-id attributes.
         * This mimics the QCSS tree structure logic.
         */
        hydrate: function(root = document.body, parentPath = '') {
            const traverse = (element, currentPath) => {
                let newPath = currentPath;
                
                if (element.hasAttribute('data-ref')) {
                    const ref = element.getAttribute('data-ref');
                    newPath = currentPath ? `${currentPath} ${ref}` : ref;
                    
                    let hash = this.manifest[newPath];
                    if (!hash) {
                        const segments = newPath.split(' ');
                        const leaf = segments[segments.length - 1];
                        hash = this.manifest[leaf];
                    }
                    if (hash) {
                        element.setAttribute('q-id', hash);
                    }
                }
                
                // Recursively traverse children
                for (let i = 0; i < element.children.length; i++) {
                    traverse(element.children[i], newPath);
                }
            };
            
            traverse(root, parentPath);
        },

        /**
         * Selects elements based on QCSS data-ref path.
         * Usage: QCSS.select('root header title')
         * 
         * If manifest is present, uses hashed ID selector [q-id="..."]
         * Otherwise falls back to nested [data-ref] selectors.
         */
        select: function(path) {
            const selector = this._toSelector(path);
            return document.querySelector(selector);
        },

        /**
         * Selects all elements based on QCSS data-ref path.
         */
        selectAll: function(path) {
            const selector = this._toSelector(path);
            return document.querySelectorAll(selector);
        },

        /**
         * Converts a space-separated QCSS path to a CSS attribute selector string.
         * Example: "root header" -> '[data-ref="root"] [data-ref="header"]'
         */
        _toSelector: function(path) {
            // If we have a manifest entry for this exact path, use it!
            // But we need to handle pseudo-classes like "root button:hover"
            // The manifest only contains element paths.
            
            // Check exact match first
            if (this.manifest[path]) {
                return `[q-id="${this.manifest[path]}"]`;
            }
            
            // Check if path has pseudo/attribute at the end
            const segments = path.split(' ');
            const last = segments[segments.length - 1];
            const match = last.match(/^([\w-]+)(.*)$/);
            if (match && match[2]) {
                 // It has extras. Reconstruct identity path.
                 const identityPath = [...segments.slice(0, -1), match[1]].join(' ');
                 if (this.manifest[identityPath]) {
                     return `[q-id="${this.manifest[identityPath]}"]${match[2]}`;
                 }
            }

            // Fallback to legacy data-ref selector if no hash found
            return path.split(/\s+/)
                .filter(Boolean)
                .map(part => {
                    const match = part.match(/^([\w-]+)(.*)$/);
                    if (match) {
                        return `[data-ref="${match[1]}"]${match[2]}`;
                    }
                    return `[data-ref="${part}"]`;
                })
                .join(' ');
        }
    };

    global.QCSS = QCSS;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

if (typeof module !== 'undefined' && module.exports) {
    module.exports = global.QCSS;
}
